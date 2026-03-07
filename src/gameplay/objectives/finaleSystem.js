/**
 * @module finaleSystem
 * Manages the end-game nest sequence: activating the finale (all rings cleared),
 * animating the nest glow and eggs, and completing the stage when the bird lands.
 */
import * as THREE from 'three';
import { WIN_ANIMATION_SECONDS } from '../core/config.js';
import { formatTime } from '../core/math.js';

/**
 * Activates the finale sequence: enables the nest glow, reveals the eggs,
 * and spawns the three-enemy finale wave at the corners of the world.
 * Guards against double-activation with the finaleActive flag.
 */
export function activateFinale(game) {
  if (game.state.finaleActive) return;
  game.state.finaleActive = true;
  setNestFinale(game, true);
  game.spawnEnemyWave('finale');
}

/** Toggles the visibility of the nest glow ring and the three egg props. */
export function setNestFinale(game, active) {
  game.perchGlow.visible = active;
  game.nestEggs.forEach((egg) => {
    egg.visible = active;
  });
}

/**
 * Pulses the nest glow and egg emissive intensities while the finale or the
 * completed state is active, giving visual feedback that the nest is the target.
 */
export function updateNestFinale(game, _delta, elapsed) {
  const active = game.state.finaleActive || game.state.completed;
  if (!active) {
    game.perchGlow.visible = false;
    return;
  }
  game.perchGlow.visible = true;
  game.perchGlow.material.opacity = 0.18 + Math.sin(elapsed * 5.2) * 0.08;
  game.perchGlow.scale.setScalar(1 + Math.sin(elapsed * 3.4) * 0.06);
  game.nestLip.material.emissiveIntensity = 0.38 + Math.sin(elapsed * 4.2) * 0.14;
  game.nestEggs.forEach((egg, index) => {
    egg.visible = true;
    egg.position.y = game.perchPlatform.position.y + 1.2 + Math.sin(elapsed * 3 + index) * 0.14;
    egg.material.emissiveIntensity = 0.16 + Math.sin(elapsed * 4.6 + index) * 0.08;
  });
}

/** Returns the world-space landing point on top of the nest platform. */
export function getNestLandingPoint(game) {
  return game.perch.localToWorld(new THREE.Vector3(0, game.perchPlatform.position.y + 0.8, 0));
}

/**
 * Returns true if the ground-raycast hit point is within the landing zone on top
 * of the nest, and if the nest is in a state where landing is meaningful
 * (finale active or stage already completed).
 */
export function canSafelyLandOnNest(game, hitPoint) {
  if (!game.state.finaleActive && !game.state.completed) return false;
  const nestTop = getNestLandingPoint(game);
  const flatDistance = game.tmpVector.set(hitPoint.x - nestTop.x, 0, hitPoint.z - nestTop.z).length();
  return flatDistance < 8;
}

/**
 * Marks the stage as complete, awards a skill point, records the finish time,
 * and shows the finish overlay with the stage summary. Triggers the win animation
 * and opens the skill menu so the player can upgrade before the next stage.
 */
export function completeStage(game) {
  game.state.completed = true;
  game.state.autopilot = false;
  game.state.paused = false;
  game.giveSkillPoint(1);
  game.state.finishTime = (performance.now() - game.state.missionStartedAt) / 1000;
  game.state.pendingStageAdvance = true;
  game.state.winAnimationTimer = WIN_ANIMATION_SECONDS;
  game.ui.finishSummary.textContent = `Stage ${game.state.stage} clear in ${formatTime(game.state.finishTime)}. Skill point added. Choose one skill to open the next route.`;
  game.ui.pauseOverlay.classList.add('is-hidden');
  game.ui.finishOverlay.classList.remove('is-hidden');
  game.toggleSkillMenu(true);
}
