/**
 * @module cameraSystem
 * Positions and orients the follow camera each frame. The camera trails the bird
 * via exponential smoothing so sudden direction changes feel weighted. FOV widens
 * at high speed to accentuate the sense of velocity.
 */
import * as THREE from 'three';
import { forwardFromAngles, smoothFactor } from '../core/math.js';

const clamp = THREE.MathUtils.clamp;

/**
 * Updates the camera position, look-at target, and field of view.
 * In showcase mode the camera orbits the bird at a fixed radius instead.
 */
export function updateCamera(game, delta) {
  if (game.state.showcaseMode) {
    // Orbit smoothly around the bird for the showcase / screenshot mode.
    const time = game.clock.elapsedTime;
    const radius = 20;
    const height = 9;
    const desired = game.tmpVector
      .copy(game.bird.root.position)
      .add(new THREE.Vector3(Math.cos(time * 0.35) * radius, height, Math.sin(time * 0.35) * radius));
    game.camera.position.lerp(desired, smoothFactor(2.8, delta));
    game.cameraTarget.copy(game.bird.root.position).add(new THREE.Vector3(0, 2.4, 0));
    game.camera.lookAt(game.cameraTarget);
    return;
  }

  const forward = forwardFromAngles(game.bird.heading, game.bird.pitch * 0.8, game.forwardVector);
  const zoom = clamp(game.state.cameraZoom ?? 1, 0.6, 1.8);
  const cameraTuning = game.tuning.camera;
  // Pull the camera further back the faster the bird is flying for natural framing.
  const speedFactor = clamp(Math.abs(game.bird.speed) / 40, 0, 1);
  const desired = game.tmpVector
    .copy(game.bird.root.position)
    .addScaledVector(forward, (-cameraTuning.distanceBase - game.bird.speed * cameraTuning.distanceSpeedScale) * zoom)
    .add(new THREE.Vector3(0, 5.2 + clamp(game.bird.verticalVelocity * 0.18, -1, 2.2), 0));

  game.camera.position.lerp(desired, smoothFactor(cameraTuning.followLag, delta));

  // The look-ahead target is slightly above the bird and 10 units ahead to
  // give the camera a natural horizon-seeking lean rather than staring at feet.
  game.cameraTarget
    .copy(game.bird.root.position)
    .addScaledVector(forward, 10)
    .add(new THREE.Vector3(0, 1.8, 0));

  // Widen the FOV at high speed to amplify the feeling of going fast.
  const targetFov = 58 + speedFactor * cameraTuning.fovBoost;
  game.camera.fov = THREE.MathUtils.lerp(game.camera.fov, targetFov, smoothFactor(5, delta));
  game.camera.updateProjectionMatrix();
  game.camera.lookAt(game.cameraTarget);
}
