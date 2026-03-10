import * as THREE from 'three';
import { forwardFromAngles, smoothFactor } from '../core/math.js';

const clamp = THREE.MathUtils.clamp;

export function updateCamera(game, delta) {

  if (game.state.freeCameraMode) {
    const lookSpeed = 1.6;
    game.state.freeCameraHeading -= game.mouseAim.x * lookSpeed * delta;
    game.state.freeCameraPitch = clamp(game.state.freeCameraPitch + game.mouseAim.y * lookSpeed * delta, -1.3, 1.3);

    const moveSpeed = (game.keys.has('ShiftLeft') || game.keys.has('ShiftRight') ? 42 : 24) * delta;
    const forward = forwardFromAngles(game.state.freeCameraHeading, game.state.freeCameraPitch, game.forwardVector);
    const right = game.tmpVector2.set(Math.cos(game.state.freeCameraHeading), 0, -Math.sin(game.state.freeCameraHeading));

    if (game.keys.has('KeyW')) game.camera.position.addScaledVector(forward, moveSpeed);
    if (game.keys.has('KeyS')) game.camera.position.addScaledVector(forward, -moveSpeed);
    if (game.keys.has('KeyA')) game.camera.position.addScaledVector(right, -moveSpeed);
    if (game.keys.has('KeyD')) game.camera.position.addScaledVector(right, moveSpeed);
    if (game.keys.has('KeyE')) game.camera.position.y += moveSpeed;
    if (game.keys.has('KeyQ')) game.camera.position.y -= moveSpeed;

    game.cameraTarget.copy(game.camera.position).addScaledVector(forward, 10);
    game.camera.lookAt(game.cameraTarget);
    return;
  }

  if (game.state.showcaseMode) {
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
  const speedFactor = clamp(Math.abs(game.bird.speed) / 40, 0, 1);
  const desired = game.tmpVector
    .copy(game.bird.root.position)
    .addScaledVector(forward, (-cameraTuning.distanceBase - game.bird.speed * cameraTuning.distanceSpeedScale) * zoom)
    .add(new THREE.Vector3(0, 5.2 + clamp(game.bird.verticalVelocity * 0.18, -1, 2.2), 0));

  game.camera.position.lerp(desired, smoothFactor(cameraTuning.followLag, delta));

  game.cameraTarget
    .copy(game.bird.root.position)
    .addScaledVector(forward, 10)
    .add(new THREE.Vector3(0, 1.8, 0));

  const targetFov = 58 + speedFactor * cameraTuning.fovBoost;
  game.camera.fov = THREE.MathUtils.lerp(game.camera.fov, targetFov, smoothFactor(5, delta));
  game.camera.updateProjectionMatrix();
  game.camera.lookAt(game.cameraTarget);
}
