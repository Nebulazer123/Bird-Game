import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

export function smoothFactor(rate, delta) {
  return 1 - Math.exp(-rate * delta);
}

export function wrapAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
}

export function seed(index) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(whole / 60)).padStart(2, '0');
  const remaining = String(whole % 60).padStart(2, '0');
  return `${minutes}:${remaining}`;
}

export function forwardFromAngles(yaw, pitch, target = new THREE.Vector3()) {
  const cosPitch = Math.cos(pitch);
  return target.set(
    Math.sin(yaw) * cosPitch,
    Math.sin(pitch),
    Math.cos(yaw) * cosPitch,
  );
}

export function clamp01(value) {
  return clamp(value, 0, 1);
}

