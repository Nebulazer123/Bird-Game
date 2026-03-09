/**
 * @module ringsSystem
 * Per-frame ring animation, ring-crossing detection, and guidance arrow steering.
 * Ring crossing is plane-based: the bird must cross the ring's local XY plane
 * and the crossing point must fall within RING_CLEAR_RADIUS of the ring centre.
 */
import * as THREE from 'three';
import { FEATHER_RING_STEP, RING_CLEAR_RADIUS } from '../core/config.js';
import { smoothFactor } from '../core/math.js';
import {
  activateFinale,
  completeStage,
  getNestLandingPoint,
  updateNestFinale,
} from './finaleSystem.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const WIND_GATE_TONES = ['C4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'];
const WIND_GATE_PHRASE_LENGTH = 4;

function getWindGateTone(index) {
  return WIND_GATE_TONES[index % WIND_GATE_TONES.length];
}

/**
 * Returns true if the bird's movement this frame crossed the active ring's plane
 * within the clear radius. Uses a parametric line-plane intersection so the check
 * is reliable even at high speeds where the bird might teleport through thin geometry.
 */
export function didPassActiveRing(_game, activeRing, previousPosition, currentPosition) {
  if (!activeRing) return false;
  const center = activeRing.group.position;
  const normal = activeRing.normal;

  const prevOffset = previousPosition.clone().sub(center);
  const currOffset = currentPosition.clone().sub(center);
  // Determine which side of the ring plane each position is on.
  const prevDot = prevOffset.dot(normal);
  const currDot = currOffset.dot(normal);
  const crossedPlane = prevDot * currDot <= 0; // Opposite signs means a plane crossing.
  if (!crossedPlane) return false;

  const denominator = prevDot - currDot;
  if (Math.abs(denominator) < 1e-5) return false;
  const interpolation = clamp(prevDot / denominator, 0, 1);
  const crossingPoint = previousPosition.clone().lerp(currentPosition, interpolation);
  // Project the radial component of the crossing point onto the ring plane to
  // measure how far from the centre the bird actually passed through.
  const radial = crossingPoint.clone().sub(center).addScaledVector(normal, -crossingPoint.clone().sub(center).dot(normal));
  return radial.length() <= RING_CLEAR_RADIUS;
}

/**
 * Immediately awards the active ring clear and advances the ring index.
 * Called when using debug tools or when the plane-crossing check confirms a pass.
 * Also awards feather bonuses at the configured ring-step interval.
 */
export function forceClearActiveRing(game) {
  const ring = game.courseRings[game.state.activeRingIndex];
  if (!ring || ring.cleared) return;
  ring.cleared = true;
  ring.removing = true;
  ring.captureTimer = 0.24;
  game.state.activeRingIndex += 1;

  if (game.features.mode === 'zen') {
    game.state.zen.windGatesPassed += 1;
    game.bird.boostCooldown = Math.max(0, game.bird.boostCooldown - 1.1);
    game.state.windPulseCooldown = Math.max(0, game.state.windPulseCooldown - 0.9);
    game.state.recentPulseTimer = Math.max(game.state.recentPulseTimer, 0.22);
    game.playAudioCue('windGate');
    game.playNoteCollect(getWindGateTone(game.state.zen.windGatesPassed - 1));
    if (game.state.zen.windGatesPassed % WIND_GATE_PHRASE_LENGTH === 0) {
      game.state.recentPulseTimer = Math.max(game.state.recentPulseTimer, 0.34);
      game.playAudioCue('compose');
    }

    if (game.state.activeRingIndex >= game.state.totalRings) {
      game.state.activeRingIndex = 0;
      game.courseRings.forEach((courseRing) => {
        courseRing.cleared = false;
        courseRing.removing = false;
        courseRing.captureTimer = 0;
        courseRing.group.visible = true;
        courseRing.group.scale.setScalar(1);
        courseRing.group.position.copy(courseRing.basePosition);
      });
    }
    return;
  }

  game.state.ringsCleared += 1;
  game.state.score += 150;
  const featherCount = Math.floor(game.state.ringsCleared / FEATHER_RING_STEP);
  if (featherCount > game.state.feathersAwardedFromRings) {
    game.state.feathers += featherCount - game.state.feathersAwardedFromRings;
    game.state.feathersAwardedFromRings = featherCount;
  }
  if (game.state.activeRingIndex >= game.state.totalRings) activateFinale(game);
}

/**
 * Debug helper: synthetically positions the bird on either side of the active ring
 * and calls didPassActiveRing to confirm the detection works correctly.
 */
export function debugPassActiveRing(game) {
  const ring = game.courseRings[game.state.activeRingIndex];
  if (!ring || ring.cleared) return false;
  const center = ring.group.position.clone();
  const normal = ring.normal.clone();
  const from = center.clone().addScaledVector(normal, -9.4);
  const to = center.clone().addScaledVector(normal, 9.4);
  const passed = didPassActiveRing(game, ring, from, to);
  if (passed) {
    game.previousBirdPosition.copy(from);
    game.bird.root.position.copy(to);
    forceClearActiveRing(game);
    return true;
  }
  return false;
}

/**
 * Rotates the camera-space guidance arrow to point toward the next objective.
 * In zen mode the target is the next uncollected note; in challenge mode it is
 * the active ring or, when all rings are cleared, the nest landing point.
 */
export function updateGuidanceArrow(game, delta) {
  if (!game.guidanceArrow) return;
  const zenTarget = game.zenNotes.find((note) => !note.collected)?.mesh?.position;
  const target = game.features.mode === 'zen'
    ? zenTarget ?? game.courseData.nestPosition
    : game.state.activeRingIndex < game.state.totalRings
      ? game.courseRings[game.state.activeRingIndex]?.group.position
      : game.courseData.nestPosition;
  if (!target) {
    game.guidanceArrow.visible = false;
    return;
  }
  game.guidanceArrow.visible = true;
  const localTarget = game.camera.worldToLocal(target.clone());
  const angle = Math.atan2(localTarget.y, localTarget.x);
  game.guidanceArrow.rotation.z = lerp(game.guidanceArrow.rotation.z, angle, smoothFactor(8, Math.max(delta, 0.016)));
}

/**
 * Main course update: animates ring glow/bob, checks for a ring crossing each
 * frame, and delegates to updateNestFinale for the end-game nest sequence.
 * Also handles the nest landing detection in challenge mode.
 */
export function updateCourse(game, delta, elapsed) {
  const activeRing = game.courseRings[game.state.activeRingIndex];
  // Snapshot position before physics (done by GameEngine) to use as the "previous" frame position.
  const previousPosition = game.previousBirdPosition.clone();

  game.courseRings.forEach((ring, index) => {
    if (ring.removing) {
      ring.captureTimer = Math.max(0, ring.captureTimer - delta);
      const pop = 1 + (ring.captureTimer / 0.24) * 0.22;
      ring.group.scale.setScalar(pop);
      ring.frame.material.emissiveIntensity = 2.5;
      ring.accent.material.emissiveIntensity = 2.8;
      ring.group.position.y = ring.basePosition.y + Math.sin(elapsed * 8) * 1.1;
      if (ring.captureTimer <= 0) {
        ring.group.visible = false;
        ring.removing = false;
      }
      return;
    }
    if (ring.cleared) return;

    ring.group.visible = true;
    ring.group.position.y = ring.basePosition.y + Math.sin(elapsed * 1.5 + ring.group.userData.phase) * 0.65;

    const isActive = index === game.state.activeRingIndex;
    const glowTarget = isActive ? 1.85 : 0.45;
    ring.frame.material.emissiveIntensity = lerp(ring.frame.material.emissiveIntensity, glowTarget, smoothFactor(8, Math.max(delta, 0.016)));
    ring.accent.material.emissiveIntensity = lerp(ring.accent.material.emissiveIntensity, glowTarget + 0.16, smoothFactor(8, Math.max(delta, 0.016)));
    ring.group.scale.setScalar(lerp(ring.group.scale.x, isActive ? 1.12 : 1, smoothFactor(6, Math.max(delta, 0.016))));
  });

  updateGuidanceArrow(game, delta);
  updateNestFinale(game, delta, elapsed);

  if (activeRing && !activeRing.cleared) {
    const currentPosition = game.bird.root.position.clone();
    if (didPassActiveRing(game, activeRing, previousPosition, currentPosition)) {
      forceClearActiveRing(game);
    }
  }

  if (game.features.mode === 'challenge' && game.state.activeRingIndex >= game.state.totalRings && !game.state.completed) {
    const nestTop = getNestLandingPoint(game);
    const landingDistance = nestTop.distanceTo(game.bird.root.position);
    if (landingDistance < 8 && game.bird.speed < 32) {
      completeStage(game);
    }
  }
}
