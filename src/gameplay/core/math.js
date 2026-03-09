/**
 * @module math
 * Shared math utilities used across the game. All functions are pure and
 * allocation-friendly – most accept an optional `target` vector to avoid
 * creating throwaway objects every frame.
 */
import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

/**
 * Returns a smoothing blend factor for exponential lerp.
 * Using `1 - exp(-rate * delta)` ensures frame-rate independence: the same
 * rate value produces the same perceptual speed regardless of delta.
 * @param {number} rate  - Higher = faster convergence.
 * @param {number} delta - Frame time in seconds.
 */
export function smoothFactor(rate, delta) {
  return 1 - Math.exp(-rate * delta);
}

/**
 * Wraps an angle in radians to the range (-π, π].
 * Needed after accumulating yaw/pitch to prevent numeric drift.
 */
export function wrapAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
}

/**
 * Deterministic pseudo-random value in [0, 1) based on an integer index.
 * Avoids seeding Math.random so procedural world generation is reproducible
 * for a given stage seed.
 */
export function seed(index) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

/**
 * Formats a duration in seconds as "MM:SS" for the finish-time display.
 * Clamps to zero so negative values (e.g. during reset) render as "00:00".
 */
export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(whole / 60)).padStart(2, '0');
  const remaining = String(whole % 60).padStart(2, '0');
  return `${minutes}:${remaining}`;
}

/**
 * Converts yaw and pitch angles into a normalized forward direction vector.
 * Used every frame by the flight system and camera to orient the bird correctly.
 * @param {number}        yaw    - Rotation around the Y axis (radians).
 * @param {number}        pitch  - Rotation around the X axis (radians).
 * @param {THREE.Vector3} target - Optional output vector to write into.
 */
export function forwardFromAngles(yaw, pitch, target = new THREE.Vector3()) {
  const cosPitch = Math.cos(pitch);
  return target.set(
    Math.sin(yaw) * cosPitch,
    Math.sin(pitch),
    Math.cos(yaw) * cosPitch,
  );
}

/** Convenience wrapper that clamps a value to [0, 1]. */
export function clamp01(value) {
  return clamp(value, 0, 1);
}

