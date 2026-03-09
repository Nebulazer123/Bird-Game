/**
 * @module bindings
 * Attaches all DOM event listeners for UI buttons and global keyboard/mouse/window
 * events. Kept separate from game logic so the event wiring is easy to audit.
 */

/**
 * Returns true if the keyboard event matches the backtick / grave accent key that
 * toggles the debug panel. Handles various browser/OS keycodes for this key.
 */
function isDebugToggleKey(event) {
  const rawCode = Number(event.keyCode ?? event.which ?? -1);
  const key = typeof event.key === 'string' ? event.key : '';
  const code = typeof event.code === 'string' ? event.code : '';
  if (code === 'Backquote' || code === 'IntlBackslash') return true;
  if (rawCode === 192 || rawCode === 223 || rawCode === 220) return true;
  return key === '`' || key === '~' || key === 'Dead' || key === 'ˋ';
}

/**
 * Wires click handlers for all overlay buttons (skill tree, restart, pause,
 * debug actions). Must be called once during construction.
 */
export function bindUi(game) {
  game.ui.skillButtons.forEach((button) => {
    button.addEventListener('click', () => {
      game.applySkill(button.dataset.skill);
    });
  });

  game.ui.openSkillsButton.addEventListener('click', () => {
    if (game.features.mode === 'zen') {
      game.resetMission();
      return;
    }
    game.ui.finishOverlay.classList.add('is-hidden');
    game.toggleSkillMenu(true);
  });

  game.ui.restartButton.addEventListener('click', () => {
    game.resetMission();
  });

  game.ui.pauseResumeButton.addEventListener('click', () => {
    game.togglePause(false);
  });

  game.ui.pauseRestartButton.addEventListener('click', () => {
    game.resetMission();
    game.togglePause(false);
  });

  game.ui.debugToggleAutopilot.addEventListener('click', () => {
    game.state.autopilot = !game.state.autopilot;
  });

  game.ui.debugResetMission.addEventListener('click', () => {
    game.resetMission();
  });

  game.ui.debugRespawnEnemy.addEventListener('click', () => {
    if (game.features.mode === 'zen') {
      game.spawnTerritoryMoment();
    } else {
      game.spawnEnemyWave(game.state.finaleActive ? 'finale' : 'patrol');
    }
  });

  game.ui.debugGodMode.addEventListener('click', () => {
    game.toggleGodMode();
  });

  if (game.ui.debugShowcaseToggle) {
    game.ui.debugShowcaseToggle.addEventListener('click', () => {
      game.toggleShowcaseMode();
    });
  }

  if (game.ui.debugAddSkill) {
    game.ui.debugAddSkill.addEventListener('click', () => {
      game.giveSkillPoint(1);
    });
  }

  if (game.ui.debugTerritoryButton) {
    game.ui.debugTerritoryButton.addEventListener('click', () => {
      game.spawnTerritoryMoment();
    });
  }

  if (game.ui.debugOpenButton) {
    game.ui.debugOpenButton.addEventListener('click', () => {
      game.toggleDebugPanel();
    });
  }
}

/**
 * Attaches global window / document event listeners for resize, mouse, keyboard,
 * and unhandled errors. Call once after the DOM is ready.
 */
export function bindEvents(game) {
  window.addEventListener('resize', () => game.onResize());

  window.addEventListener('mousemove', (event) => {
    game.unlockAudio(); // Treat any mouse movement as a user gesture.
    if (game.state.autopilot) return;
    game.setMouseAimFromPointer(event.clientX, event.clientY);
  });

  game.ui.root.addEventListener('mouseleave', () => {
    if (game.state.autopilot) return;
    game.resetMouseAim();
  });

  game.ui.canvas.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    game.unlockAudio();
    if (!game.state.paused && !game.state.completed && !game.state.skillMenuOpen) {
      game.firePlayerProjectile();
    }
  });

  game.ui.canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    // Scroll wheel adjusts camera zoom distance within the allowed range.
    const next = game.state.cameraZoom + event.deltaY * 0.0015;
    game.state.cameraZoom = Math.max(0.6, Math.min(1.8, next));
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (
      ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyQ', 'Escape', 'Backquote', 'Tab', 'KeyP'].includes(event.code)
      || isDebugToggleKey(event)
    ) {
      event.preventDefault();
    }

    game.unlockAudio();

    if (event.code === 'Escape') {
      game.togglePause();
      return;
    }
    if (isDebugToggleKey(event)) {
      game.toggleDebugPanel();
      return;
    }
    if (event.code === 'Tab') {
      game.toggleSkillMenu();
      return;
    }
    if ((game.state.paused || game.state.skillMenuOpen) && event.code !== 'KeyP') {
      return;
    }

    if (game.state.awaitingTakeoff && game.isMovementKey(event.code)) {
      game.releaseTakeoffLock();
    }

    game.keys.add(event.code);

    if (event.code === 'KeyP') game.state.autopilot = !game.state.autopilot;
  });

  window.addEventListener('keyup', (event) => {
    game.keys.delete(event.code);
  });

  window.addEventListener('blur', () => {
    game.keys.clear(); // Release all keys so nothing is stuck when the window loses focus.
    if (!game.state.autopilot) {
      game.resetMouseAim();
    }
  });

  // Capture unhandled errors so they are visible in the debug panel JSON.
  window.addEventListener('error', (event) => {
    game.state.errors.push(String(event.error ?? event.message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    game.state.errors.push(String(event.reason));
  });
}
