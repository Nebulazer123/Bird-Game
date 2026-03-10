export function updateDebugPanel(game) {
  if (!game.state.debugOpen) return;

  game.ui.debugState.textContent = JSON.stringify({
    mode: game.features.mode,
    paused: game.state.paused,
    autopilot: game.state.autopilot,
    godMode: game.state.godMode,
    showcaseMode: game.state.showcaseMode,
    freeCameraMode: game.state.freeCameraMode,
    assets: {
      playerModel: Boolean(game.bird.model),
      enemyModel: game.enemies.some((enemy) => Boolean(enemy.model)),
      hdri: Boolean(game.scene.environment),
      kenney: {
        trees: game.models.kenney.trees.length,
        rocks: game.models.kenney.rocks.length,
        foliage: game.models.kenney.foliage.length,
      },
    },
    bird: {
      x: Number(game.bird.root.position.x.toFixed(2)),
      y: Number(game.bird.root.position.y.toFixed(2)),
      z: Number(game.bird.root.position.z.toFixed(2)),
      speed: Number(game.bird.speed.toFixed(2)),
      heading: Number(game.bird.heading.toFixed(3)),
      pitch: Number(game.bird.pitch.toFixed(3)),
    },
    progress: `${game.state.ringsCleared}/${game.state.totalRings}`,
    zen: {
      notesCollected: game.state.zen.notesCollected,
      notesTotal: game.state.zen.notesTotal,
      composed: game.state.zen.composed,
      nextTarget: game.state.zen.discoveryTargetId,
    },
    health: Number(game.state.health.toFixed(1)),
    bullets: {
      player: game.playerProjectiles.length,
      enemy: game.enemyProjectiles.length,
    },
    enemy: {
      alive: game.enemies.some((enemy) => enemy.alive),
      count: game.enemies.filter((enemy) => enemy.alive).length,
      health: Number((game.getPrimaryEnemy()?.health ?? 0).toFixed(1)),
      x: Number((game.getPrimaryEnemy()?.root.position.x ?? 0).toFixed(2)),
      y: Number((game.getPrimaryEnemy()?.root.position.y ?? 0).toFixed(2)),
      z: Number((game.getPrimaryEnemy()?.root.position.z ?? 0).toFixed(2)),
    },
    input: {
      device: game.gamepad.connected ? 'gamepad' : 'keyboard-mouse',
      id: game.gamepad.id,
      mapping: game.gamepad.mapping,
      axes: game.gamepad.axes,
      buttons: game.gamepad.buttons.slice(0, 8),
      normalized: game.gamepad.inputState,
    },
  }, null, 2);

  if (game.ui.debugToggleAutopilot) {
    game.ui.debugToggleAutopilot.classList.toggle('is-active', game.state.autopilot);
  }
  game.ui.debugGodMode.classList.toggle('is-active', game.state.godMode);
  if (game.ui.debugShowcaseToggle) {
    game.ui.debugShowcaseToggle.classList.toggle('is-active', game.state.showcaseMode);
  }
  if (game.ui.debugFreeCameraToggle) {
    game.ui.debugFreeCameraToggle.classList.toggle('is-active', game.state.freeCameraMode);
  }
  if (game.ui.debugTerritoryButton) {
    game.ui.debugTerritoryButton.classList.toggle('is-active', game.state.territoryActive);
  }
}
