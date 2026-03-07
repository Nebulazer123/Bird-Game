/**
 * @module flightSystem
 * Core bird physics: applies player / autopilot inputs to heading, pitch, speed,
 * vertical velocity, and world position. Also handles wing/tail animation and
 * ground collision.
 */
import * as THREE from 'three';
import { DOWN, WORLD_LIMIT } from '../core/config.js';
import { forwardFromAngles, smoothFactor, wrapAngle } from '../core/math.js';
import { getInputState } from './input.js';
import { getStats } from './stats.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

/**
 * Decrements all time-based cooldowns and respawn timers by delta.
 * Also handles territory expiry in zen mode: when the territory timer runs out,
 * combat is disabled and enemies are cleared.
 */
export function updateCooldowns(game, delta) {
  game.bird.flapCooldown = Math.max(0, game.bird.flapCooldown - delta);
  game.bird.boostCooldown = Math.max(0, game.bird.boostCooldown - delta);
  game.bird.dashTimer = Math.max(0, game.bird.dashTimer - delta);
  game.bird.fireCooldown = Math.max(0, game.bird.fireCooldown - delta);
  game.state.respawnShieldTimer = Math.max(0, game.state.respawnShieldTimer - delta);
  game.state.damageFlashTimer = Math.max(0, game.state.damageFlashTimer - delta);
  game.state.recentHitTimer = Math.max(0, game.state.recentHitTimer - delta);
  game.state.recentPulseTimer = Math.max(0, game.state.recentPulseTimer - delta);
  game.state.windPulseTimer = Math.max(0, game.state.windPulseTimer - delta);
  game.state.windPulseCooldown = Math.max(0, game.state.windPulseCooldown - delta);
  if (game.state.territoryActive) {
    game.state.territoryTimer = Math.max(0, game.state.territoryTimer - delta);
    if (game.state.territoryTimer <= 0 && game.features.mode === 'zen') {
      game.state.territoryActive = false;
      game.features.combatEnabled = false;
      game.clearEnemies();
      game.state.enemyWave = 'calm';
    }
  }
  game.enemies.forEach((enemy) => {
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - delta);
    enemy.respawnTimer = Math.max(0, enemy.respawnTimer - delta);
  });
}

/**
 * Main bird physics update. Reads input, applies forces, integrates position, and
 * then resolves ground collision. Short-circuits for showcase/hover modes.
 * @param {object} game  - The BirdGame instance.
 * @param {number} delta - Simulation delta (zero when paused).
 */
export function updateBird(game, delta) {
  if (delta <= 0) {
    animateBird(game, 0);
    return;
  }

  if (game.state.showcaseMode) {
    game.bird.speed = lerp(game.bird.speed, 0, smoothFactor(8, delta));
    game.bird.verticalVelocity = lerp(game.bird.verticalVelocity, 0, smoothFactor(8, delta));
    animateBird(game, delta);
    return;
  }

  if (game.state.awaitingTakeoff) {
    game.state.spawnHoverClock += delta;
    game.bird.speed = lerp(game.bird.speed, 0, smoothFactor(6, delta));
    game.bird.verticalVelocity = 0;
    game.bird.bank = lerp(game.bird.bank, 0, smoothFactor(6, delta));
    game.bird.pitch = lerp(game.bird.pitch, 0, smoothFactor(6, delta));
    game.bird.root.position.y = game.state.spawnHoverY + Math.sin(game.state.spawnHoverClock * 3) * 0.35;
    game.bird.root.rotation.set(0, game.bird.heading, 0);
    game.bird.lastFlap = true;
    animateBird(game, delta);
    return;
  }

  const input = getInputState(game);
  const stats = getStats(game);
  // Unlock audio on the first gamepad input (browsers require a user gesture).
  if (game.gamepad.connected && (input.forward || input.brake || input.left || input.right || input.flap || input.boost || input.shoot || input.pulse)) {
    game.unlockAudio();
  }
  // +1 for forward, -1 for brake, 0 for cruise (the bird never fully stops).
  const driveInput = (input.forward ? 1 : 0) - (input.brake ? 1 : 0);
  const strafeInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const targetSpeed = driveInput > 0
    ? stats.maxSpeed
    : driveInput < 0
      ? -stats.reverseSpeed
      : stats.cruiseSpeed;

  // Trigger a dash burst if F / right-trigger pressed and off cooldown.
  if (input.boost && game.bird.boostCooldown <= 0) {
    game.bird.dashTimer = stats.dashDuration;
    game.bird.boostCooldown = stats.boostCooldown;
    game.playAudioCue('boost');
    game.state.tutorialUsage.boost += 1;
  }

  // Edge-trigger flap: only fires once per key-press to avoid continuous upward thrust.
  if (input.flap && !game.bird.lastFlap && game.bird.flapCooldown <= 0) {
    game.bird.verticalVelocity += stats.flapImpulse;
    game.bird.flapCooldown = stats.flapCooldown;
    game.playAudioCue('flap');
    game.state.tutorialUsage.flap += 1;
  }
  game.bird.lastFlap = input.flap;

  if (input.shoot && !game.bird.lastShoot) {
    game.firePlayerProjectile();
  }
  game.bird.lastShoot = input.shoot;

  if (input.pulse && !game.bird.lastPulse) {
    game.triggerWindPulse();
  }
  game.bird.lastPulse = input.pulse;

  if (input.pause && !game.bird.lastPause) {
    game.togglePause();
  }
  game.bird.lastPause = input.pause;

  // Accumulate yaw from mouse X offset; wrap to keep within [-π, π].
  game.bird.heading = wrapAngle(game.bird.heading + game.mouseAim.x * stats.yawRate * delta);
  game.bird.pitch = clamp(game.bird.pitch + game.mouseAim.y * stats.pitchRate * delta, -0.52, 0.48);

  game.bird.speed = lerp(game.bird.speed, targetSpeed, smoothFactor(stats.acceleration, delta));
  // During a dash the speed floor is raised; dashLift adds a brief upward kick.
  if (game.bird.dashTimer > 0) {
    game.bird.speed = Math.max(game.bird.speed, targetSpeed >= 0 ? stats.cruiseSpeed + stats.dashSpeedBonus : game.bird.speed);
    game.bird.verticalVelocity += stats.dashLift * delta;
  }

  game.bird.verticalVelocity -= stats.gravity * delta;
  game.bird.verticalVelocity *= 1 - Math.min(0.95, stats.verticalDrag * delta * 0.38);
  game.bird.verticalVelocity = clamp(game.bird.verticalVelocity, -stats.maxDrop, stats.maxClimb);

  // Integrate position using forward vector (heading+pitch) plus lateral strafe.
  const forward = forwardFromAngles(game.bird.heading, game.bird.pitch, game.forwardVector);
  game.rightVector.set(Math.cos(game.bird.heading), 0, -Math.sin(game.bird.heading));
  game.bird.root.position.addScaledVector(forward, game.bird.speed * delta);
  game.bird.root.position.addScaledVector(game.rightVector, strafeInput * stats.strafeSpeed * delta);
  game.bird.root.position.y += game.bird.verticalVelocity * delta;

  // Clamp XZ to world boundaries to prevent the bird from flying out of the terrain.
  game.bird.root.position.x = clamp(game.bird.root.position.x, -WORLD_LIMIT, WORLD_LIMIT);
  game.bird.root.position.z = clamp(game.bird.root.position.z, -WORLD_LIMIT, WORLD_LIMIT);

  resolveGround(game, stats);

  // Bank the bird body into turns; add a subtle mouse-aim lean for responsiveness.
  game.bird.bank = lerp(game.bird.bank, -strafeInput * 0.62 + game.mouseAim.x * 0.16, smoothFactor(5.5, delta));
  const pitch = clamp(-game.bird.pitch - game.bird.verticalVelocity / 28, -0.58, 0.46);
  game.bird.root.rotation.set(pitch, game.bird.heading, game.bird.bank);

  animateBird(game, delta);
}

/**
 * Casts a ray downward from above the bird and adjusts its Y position to prevent
 * clipping into the terrain. If the bird is too close to the ground and not near
 * a landing nest, it triggers the player death sequence.
 */
export function resolveGround(game, stats) {
  game.raycaster.far = 90;
  game.raycaster.set(game.bird.root.position.clone().add(new THREE.Vector3(0, 40, 0)), DOWN);
  const [hit] = game.raycaster.intersectObjects(game.groundColliders, false);

  if (!hit) {
    return;
  }

  game.state.raycastHits += 1;
  game.state.lastGroundDistance = game.bird.root.position.y - hit.point.y;

  if (game.state.lastGroundDistance < stats.minClearance) {
    if (game.canSafelyLandOnNest(hit.point)) {
      game.bird.root.position.y = hit.point.y + stats.minClearance;
      game.bird.verticalVelocity = Math.max(game.bird.verticalVelocity, 0.6);
      return;
    }

    if (!game.state.godMode && game.state.deathAnimationTimer <= 0) {
      game.triggerPlayerDeath('ground');
    }
  }
}

/**
 * Drives the procedural wing-flap and tail animation each frame.
 * When a GLTF model is present its AnimationMixer is advanced instead,
 * with speed scaled by flight velocity and whether the bird is flapping.
 */
export function animateBird(game, delta) {
  game.bird.flapCycle += delta * (5.3 + clamp(game.bird.speed / 10, 1.5, 4.5));
  const flap = Math.sin(game.bird.flapCycle) * (game.bird.lastFlap ? 0.9 : 0.52);
  const tailLift = clamp(-game.bird.verticalVelocity / 20, -0.18, 0.28);

  game.bird.leftWingPivot.rotation.z = -0.35 + flap * 0.9 + game.bird.bank * 0.2;
  game.bird.rightWingPivot.rotation.z = 0.35 - flap * 0.9 + game.bird.bank * 0.2;
  game.bird.tail.rotation.x = -Math.PI / 2 + tailLift;
  game.bird.head.rotation.x = clamp(game.bird.verticalVelocity / 16, -0.08, 0.12);

  if (game.bird.mixer) {
    const flightSpeed = clamp(Math.abs(game.bird.speed) / 18, 0.6, 2.2);
    const flapBoost = game.bird.lastFlap ? 0.35 : 0;
    game.bird.mixer.update(delta * (flightSpeed + flapBoost));
  }
}
