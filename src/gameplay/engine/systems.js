/**
 * @module systems
 * Factory functions that produce the individual systems plugged into GameEngine.
 * Each system is a plain object with a single `update(game, delta, elapsed)` method,
 * keeping concerns separated and making it easy to add, remove, or reorder passes.
 * The execution order in createDefaultSystems() defines the full per-frame pipeline.
 */

/** Computes the shared frame descriptor used by all downstream systems. */
function createFrameSystem() {
  return {
    update(game, delta, elapsed) {
      // When the UI is frozen (paused or skill menu open) the simulation delta is
      // forced to zero so physics, AI, and objectives halt without stopping the render.
      const uiFrozen = game.state.paused || game.state.skillMenuOpen;
      const simulationDelta = uiFrozen && !game.state.autopilot ? 0 : delta;
      game.frame = { delta, elapsed, uiFrozen, simulationDelta };
    },
  };
}

/** Drives the autopilot AI or clears virtualInput when player-controlled. */
function createAutopilotSystem() {
  return {
    update(game, delta) {
      if (game.state.autopilot) {
        game.updateAutopilot(delta);
      } else {
        game.virtualInput = game.emptyInput();
      }
    },
  };
}

/** Polls the Gamepad API and normalises axes / buttons into a consistent input state. */
function createInputDiagnosticsSystem() {
  return {
    update(game) {
      game.updateGamepadState();
    },
  };
}

/** Smoothly interpolates the mouse aim values towards their targets each frame. */
function createAimSystem() {
  return {
    update(game, delta) {
      game.updateAimState(delta);
    },
  };
}

/** Ticks down all time-based cooldown and timer values on the bird and enemies. */
function createCooldownSystem() {
  return {
    update(game) {
      game.updateCooldowns(game.frame.simulationDelta);
    },
  };
}

/**
 * Handles the bird lifecycle: death tumble, win celebration, or normal flight.
 * Uses simulationDelta so all movement pauses while UI overlays are open.
 */
function createLifecycleSystem() {
  return {
    update(game, delta) {
      if (game.state.deathAnimationTimer > 0) {
        game.updateDeathAnimation(delta);
      } else if (game.state.winAnimationTimer > 0) {
        game.updateWinAnimation(delta);
      } else {
        game.updateBird(game.frame.simulationDelta);
      }
    },
  };
}

/** Updates enemy AI movement, targeting, and shooting (challenge mode only). */
function createEnemySystem() {
  return {
    update(game, _delta, elapsed) {
      if (!game.features.combatEnabled) return;
      game.updateEnemy(game.frame.simulationDelta, elapsed);
    },
  };
}

/** Moves all active projectiles, checks collisions, and removes expired shots. */
function createProjectileSystem() {
  return {
    update(game) {
      if (!game.features.combatEnabled) return;
      game.updateProjectiles(game.frame.simulationDelta);
    },
  };
}

/** Animates rings, checks ring-crossing events, and triggers stage completion. */
function createCourseSystem() {
  return {
    update(game, _delta, elapsed) {
      game.updateCourse(game.frame.simulationDelta, elapsed);
    },
  };
}

/** Animates zen notes and detects collection proximity (zen mode only). */
function createZenDiscoverySystem() {
  return {
    update(game, delta, elapsed) {
      game.updateZenDiscovery(delta, elapsed);
    },
  };
}

/** Checks whether the player can compose the valley song and triggers completion. */
function createZenCompletionSystem() {
  return {
    update(game) {
      game.updateZenCompletion();
    },
  };
}

/** Animates water, drifts clouds, and repositions the sun shadow based on bird position. */
function createEnvironmentSystem() {
  return {
    update(game, _delta, elapsed) {
      game.updateEnvironment(game.frame.delta, elapsed);
    },
  };
}

/**
 * Positions and orients the follow camera; always uses real delta (not simulationDelta)
 * so the camera keeps tracking the bird even when simulation is paused.
 */
function createCameraSystem() {
  return {
    update(game) {
      game.updateCamera(game.frame.delta);
    },
  };
}

/** Writes live stats (speed, health, objective text, cooldown bars) to the DOM HUD. */
function createHudSystem() {
  return {
    update(game) {
      game.updateHud();
    },
  };
}

/** Syncs master volume and starts background ambience once audio is unlocked. */
function createAudioSystem() {
  return {
    update(game) {
      game.updateAudio();
    },
  };
}

/** Updates the collapsible debug panel JSON readout (only runs when panel is open). */
function createDebugPanelSystem() {
  return {
    update(game) {
      game.updateDebugPanel();
    },
  };
}

/**
 * Assembles and returns the ordered list of all default game systems.
 * The order is intentional: frame metadata → input → physics → AI →
 * objectives → environment → camera → audio → HUD → debug.
 */
export function createDefaultSystems() {
  return [
    createFrameSystem(),
    createInputDiagnosticsSystem(),
    createAutopilotSystem(),
    createAimSystem(),
    createCooldownSystem(),
    createLifecycleSystem(),
    createEnemySystem(),
    createProjectileSystem(),
    createCourseSystem(),
    createZenDiscoverySystem(),
    createZenCompletionSystem(),
    createEnvironmentSystem(),
    createCameraSystem(),
    createAudioSystem(),
    createHudSystem(),
    createDebugPanelSystem(),
  ];
}
