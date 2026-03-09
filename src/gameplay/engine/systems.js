function createFrameSystem() {
  return {
    update(game, delta, elapsed) {
      const uiFrozen = game.state.paused || game.state.skillMenuOpen || game.state.startOverlayOpen;
      const simulationDelta = uiFrozen && !game.state.autopilot ? 0 : delta;
      game.frame = { delta, elapsed, uiFrozen, simulationDelta };
    },
  };
}

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

function createInputDiagnosticsSystem() {
  return {
    update(game) {
      game.updateGamepadState();
    },
  };
}

function createAimSystem() {
  return {
    update(game, delta) {
      game.updateAimState(delta);
    },
  };
}

function createCooldownSystem() {
  return {
    update(game) {
      game.updateCooldowns(game.frame.simulationDelta);
    },
  };
}

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

function createEnemySystem() {
  return {
    update(game, _delta, elapsed) {
      if (!game.features.combatEnabled) return;
      game.updateEnemy(game.frame.simulationDelta, elapsed);
    },
  };
}

function createProjectileSystem() {
  return {
    update(game) {
      if (!game.features.combatEnabled) return;
      game.updateProjectiles(game.frame.simulationDelta);
    },
  };
}

function createCourseSystem() {
  return {
    update(game, _delta, elapsed) {
      game.updateCourse(game.frame.simulationDelta, elapsed);
    },
  };
}

function createZenDiscoverySystem() {
  return {
    update(game, delta, elapsed) {
      game.updateZenDiscovery(delta, elapsed);
    },
  };
}

function createZenCompletionSystem() {
  return {
    update(game) {
      game.updateZenCompletion();
    },
  };
}

function createEnvironmentSystem() {
  return {
    update(game, _delta, elapsed) {
      game.updateEnvironment(game.frame.delta, elapsed);
    },
  };
}

function createCameraSystem() {
  return {
    update(game) {
      game.updateCamera(game.frame.delta);
    },
  };
}

function createHudSystem() {
  return {
    update(game) {
      game.updateHud();
    },
  };
}

function createAudioSystem() {
  return {
    update(game) {
      game.updateAudio();
    },
  };
}

function createDebugPanelSystem() {
  return {
    update(game) {
      game.updateDebugPanel();
    },
  };
}

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
