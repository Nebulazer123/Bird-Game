/**
 * @module input
 * Handles all input gathering and cursor/reticle management.
 * Abstracts keyboard, mouse, and gamepad sources into a unified input object
 * so the flight system does not need to know which device is active.
 */
import * as THREE from 'three';
import { smoothFactor } from '../core/math.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

/**
 * Reads all active input sources and returns a normalised action state object.
 * Autopilot and showcase mode short-circuit to virtual / empty inputs respectively.
 */
export function getInputState(game) {
  const gamepad = game.updateGamepadState();

  if (game.state.autopilot) {
    return game.virtualInput;
  }

  if (game.state.showcaseMode) {
    return game.emptyInput();
  }

  if (game.state.startOverlayOpen) {
    return game.emptyInput();
  }

  return {
    forward: game.keys.has('KeyW') || gamepad.moveY < -0.35,
    brake: game.keys.has('KeyS') || gamepad.moveY > 0.35,
    left: game.keys.has('KeyD') || gamepad.moveX > 0.35,
    right: game.keys.has('KeyA') || gamepad.moveX < -0.35,
    flap: game.keys.has('Space') || gamepad.flap,
    boost: game.keys.has('KeyF') || gamepad.boost,
    shoot: gamepad.shoot,
    pulse: game.keys.has('KeyQ') || gamepad.pulse,
    pause: gamepad.pause,
  };
}

/** Returns true for keys that count as movement and should release the takeoff lock. */
export function isMovementKey(code) {
  return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyF', 'KeyQ'].includes(code);
}

/**
 * Clears the takeoff-lock state so the bird starts flying when the player
 * presses a movement key after spawning at the nest.
 */
export function releaseTakeoffLock(game) {
  if (!game.state.awaitingTakeoff) return;
  game.state.awaitingTakeoff = false;
  game.state.spawnHoverClock = 0;
  game.bird.lastFlap = false;
}

/** Zeroes mouse aim and resets the reticle to the screen centre. */
export function resetMouseAim(game) {
  game.mouseAim.x = 0;
  game.mouseAim.y = 0;
  game.mouseAim.targetX = 0;
  game.mouseAim.targetY = 0;
  game.mouseAim.screenX = 0.5;
  game.mouseAim.screenY = 0.5;
  syncReticle(game);
}

/**
 * Converts a raw pointer position (client coordinates) into normalised aim offsets.
 * The aim range is [-1, 1] on each axis, where 0 means "centre of screen".
 */
export function setMouseAimFromPointer(game, clientX, clientY) {
  const rect = game.ui.canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const normalizedX = clamp((clientX - rect.left) / rect.width, 0, 1);
  const normalizedY = clamp((clientY - rect.top) / rect.height, 0, 1);

  game.mouseAim.targetX = (0.5 - normalizedX) * 2;
  game.mouseAim.targetY = (0.5 - normalizedY) * 2;
  game.mouseAim.screenX = normalizedX;
  game.mouseAim.screenY = normalizedY;
  syncReticle(game);
}

/** Moves the reticle DOM element to match the current screen-space aim position. */
export function syncReticle(game) {
  if (!game.ui.reticle) return;

  game.ui.reticle.style.left = `${(game.mouseAim.screenX * 100).toFixed(2)}%`;
  game.ui.reticle.style.top = `${(game.mouseAim.screenY * 100).toFixed(2)}%`;
}

/**
 * Smoothly advances the mouse aim values towards their targets.
 * When a gamepad is connected, the right-stick axes replace the mouse targets
 * and the reticle is repositioned accordingly.
 */
export function updateAimState(game, delta) {
  const blend = smoothFactor(game.tuning.input.aimSmoothing, Math.max(delta, 0.016));
  if (game.gamepad.connected) {
    game.mouseAim.targetX = game.gamepad.inputState.aimX;
    game.mouseAim.targetY = -game.gamepad.inputState.aimY;
    game.mouseAim.screenX = game.mouseAim.targetX * -0.5 + 0.5;
    game.mouseAim.screenY = game.mouseAim.targetY * -0.5 + 0.5;
    syncReticle(game);
  }
  game.mouseAim.x = lerp(game.mouseAim.x, game.mouseAim.targetX, blend);
  game.mouseAim.y = lerp(game.mouseAim.y, game.mouseAim.targetY, blend);
  return game.mouseAim;
}
