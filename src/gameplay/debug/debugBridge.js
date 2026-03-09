/**
 * @module debugBridge
 * Installs the window.__birdSongDebug console API and the window.render_game_to_text
 * helper used by automated tests and browser-based development tooling.
 * Also provides getDebugState() which returns a flat snapshot of all observable
 * game state for assertions in integration tests.
 */
import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

/**
 * Attaches all debug entry points to the window object so they are accessible
 * from the browser DevTools console without importing the game module.
 * Sets window.__birdSongReady = true when complete so tests can await readiness.
 */
export function installDebugHooks(game) {
  /** Console API surface for manual testing and automated E2E scripts. */
  window.__birdSongDebug = {
    getState: () => game.getDebugState(),
    getStats: () => game.getStats(),
    setAutopilot: (value = true) => {
      game.state.autopilot = Boolean(value);
    },
    setMouseAim: (x = 0, y = 0) => {
      game.mouseAim.targetX = clamp(x, -1, 1);
      game.mouseAim.targetY = clamp(y, -1, 1);
    },
    fire: () => game.firePlayerProjectile(),
    setHealth: (value) => {
      game.state.health = clamp(Number(value) || 0, 0, game.state.maxHealth);
    },
    hitPlayer: (amount = 15) => game.applyPlayerDamage(Number(amount) || 0),
    forceEnemyNearPlayer: () => game.forceEnemyNearPlayer(),
    forceEnemyInFront: () => game.forceEnemyInFront(),
    respawnEnemy: () => game.spawnEnemyWave(game.state.finaleActive ? 'finale' : 'patrol'),
    spawnTerritoryMoment: () => game.spawnTerritoryMoment(),
    hitEnemy: (amount = 1) => game.hitPrimaryEnemy(amount),
    clearActiveRing: () => {
      game.releaseTakeoffLock();
      return game.forceClearActiveRing();
    },
    passActiveRing: () => {
      game.releaseTakeoffLock();
      return game.debugPassActiveRing();
    },
    setEnemyHealth: (value) => game.setPrimaryEnemyHealth(value),
    togglePause: () => game.togglePause(),
    reset: () => game.resetMission(),
    spend: (skill) => game.applySkill(skill),
    giveSkillPoint: (amount = 1) => game.giveSkillPoint(amount),
    selectSkill: (skill) => game.applySkill(skill),
    setMode: (mode = 'zen') => game.setMode(mode),
    collectZenNote: (noteId) => game.collectZenNote(noteId),
    composeZenSong: () => game.composeZenSong(),
    toggleGodMode: (value) => game.toggleGodMode(value),
    toggleShowcase: (value) => game.toggleShowcaseMode(value),
    getAssets: () => ({
      playerModel: Boolean(game.bird.model),
      enemyModel: game.enemies.some((enemy) => Boolean(enemy.model)),
      hdri: Boolean(game.scene.environment),
      kenney: {
        trees: game.models.kenney.trees.length,
        rocks: game.models.kenney.rocks.length,
        foliage: game.models.kenney.foliage.length,
      },
    }),
    forceGroundTouch: () => {
      if (game.state.godMode) return false;
      game.triggerPlayerDeath('ground');
      return true;
    },
    forceFinale: () => game.activateFinale(),
    clearRings: () => {
      game.releaseTakeoffLock();
      while (game.state.activeRingIndex < game.state.totalRings) game.forceClearActiveRing();
    },
    landInNest: () => {
      game.releaseTakeoffLock();
      game.bird.root.position.copy(game.getNestLandingPoint());
      game.bird.speed = 10;
      game.updateCourse(0.016, game.clock.elapsedTime);
    },
    runScriptedCompletion: () => {
      game.releaseTakeoffLock();
      return game.runScriptedCompletion();
    },
  };

  /**
   * Returns a compact JSON-serialisable snapshot of the entire visible game state.
   * Called by Playwright tests via page.evaluate(() => render_game_to_text()).
   */
  window.render_game_to_text = () => JSON.stringify({
    mode: game.state.showcaseMode ? 'showcase' : game.state.completed ? 'complete' : game.state.paused ? 'paused' : game.state.skillMenuOpen ? 'skills' : 'flight',
    sliceMode: game.features.mode,
    coordinateSystem: 'x east-west, y up, z north-south',
    mission: game.ui.mission.textContent,
    bird: {
      x: Number(game.bird.root.position.x.toFixed(2)),
      y: Number(game.bird.root.position.y.toFixed(2)),
      z: Number(game.bird.root.position.z.toFixed(2)),
      heading: Number(game.bird.heading.toFixed(3)),
      pitch: Number(game.bird.pitch.toFixed(3)),
      speed: Number(game.bird.speed.toFixed(2)),
    },
    aim: {
      x: Number(game.mouseAim.x.toFixed(3)),
      y: Number(game.mouseAim.y.toFixed(3)),
    },
    progress: {
      stage: game.state.stage,
      ringsCleared: game.state.ringsCleared,
      totalRings: game.state.totalRings,
      feathers: game.state.feathers,
      skillPoints: game.state.skillPoints,
      notesCollected: game.state.zen.notesCollected,
      notesTotal: game.state.zen.notesTotal,
    },
    combat: {
      health: Number(game.state.health.toFixed(1)),
      playerBullets: game.playerProjectiles.length,
      enemyBullets: game.enemyProjectiles.length,
      enemyCount: game.enemies.filter((enemy) => enemy.alive).length,
      enemyHealth: Number((game.getPrimaryEnemy()?.health ?? 0).toFixed(1)),
    },
    pause: {
      paused: game.state.paused,
      debugOpen: game.state.debugOpen,
      skillMenuOpen: game.state.skillMenuOpen,
      godMode: game.state.godMode,
      showcaseMode: game.state.showcaseMode,
    },
    assets: {
      playerModel: Boolean(game.bird.model),
      enemyModel: game.enemies.some((enemy) => Boolean(enemy.model)),
      hdri: Boolean(game.scene.environment),
      kenneyDecor: game.decor.length,
    },
    nextTarget: game.state.activeRingIndex < game.state.totalRings ? game.state.activeRingIndex + 1 : 'nest',
    zen: {
      composed: game.state.zen.composed,
      nextNote: game.state.zen.discoveryTargetId,
    },
    finale: {
      active: game.state.finaleActive,
      enemyWave: game.state.enemyWave,
      eggsVisible: game.nestEggs.filter((egg) => egg.visible).length,
      glowVisible: Boolean(game.perchGlow?.visible),
    },
    raycastHits: game.state.raycastHits,
    lastGroundDistance: Number(game.state.lastGroundDistance.toFixed(2)),
  });

  /**
   * Advances the simulation by the given number of milliseconds in fixed 60 fps
   * steps, then re-renders. Used by tests to fast-forward time without real waiting.
   */
  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) {
      game.previousBirdPosition.copy(game.bird.root.position);
      game.step(1 / 60, game.clock.elapsedTime + index / 60);
    }
    game.renderer.render(game.scene, game.camera);
  };

  window.__birdSongReady = true;
}

/**
 * Returns a flat object containing the full observable game state.
 * Used by automated tests to make assertions without coupling to internal structures.
 */
export function getDebugState(game) {
  return {
    ready: true,
    stage: game.state.stage,
    mode: game.features.mode,
    ringsCleared: game.state.ringsCleared,
    totalRings: game.state.totalRings,
    feathers: game.state.feathers,
    skillPoints: game.state.skillPoints,
    zenNotesCollected: game.state.zen.notesCollected,
    zenNotesTotal: game.state.zen.notesTotal,
    zenComposed: game.state.zen.composed,
    completed: game.state.completed,
    shadowMapEnabled: game.renderer.shadowMap.enabled,
    lastGroundDistance: game.state.lastGroundDistance,
    raycastHits: game.state.raycastHits,
    activeRingIndex: game.state.activeRingIndex,
    boostCooldown: game.bird.boostCooldown,
    fireCooldown: game.bird.fireCooldown,
    birdPosition: game.bird.root.position.toArray(),
    birdHeading: game.bird.heading,
    birdPitch: game.bird.pitch,
    speed: game.bird.speed,
    cameraZoom: game.state.cameraZoom,
    cameraDistance: Number(game.camera.position.distanceTo(game.bird.root.position).toFixed(3)),
    health: game.state.health,
    autopilot: game.state.autopilot,
    paused: game.state.paused,
    debugOpen: game.state.debugOpen,
    awaitingTakeoff: game.state.awaitingTakeoff,
    skillMenuOpen: game.state.skillMenuOpen,
    godMode: game.state.godMode,
    showcaseMode: game.state.showcaseMode,
    finaleActive: game.state.finaleActive,
    playerDeaths: game.state.playerDeaths,
    playerBullets: game.playerProjectiles.length,
    enemyBullets: game.enemyProjectiles.length,
    enemyAlive: game.enemies.some((enemy) => enemy.alive),
    enemyHealth: game.getPrimaryEnemy()?.health ?? 0,
    enemyCount: game.enemies.filter((enemy) => enemy.alive).length,
    enemyWave: game.state.enemyWave,
    territoryActive: game.state.territoryActive,
    territoryTimer: game.state.territoryTimer,
    primaryEnemyPosition: game.getPrimaryEnemy()?.root.position.toArray() ?? null,
    nestGlow: Boolean(game.perchGlow?.visible),
    eggsVisible: game.nestEggs.filter((egg) => egg.visible).length,
    pendingStageAdvance: game.state.pendingStageAdvance,
    unlockedSkills: { ...game.state.unlockedSkills },
    courseRingCount: game.courseRings.length,
    visibleRingCount: game.courseRings.filter((ring) => ring.group.visible).length,
    capturingRingCount: game.courseRings.filter((ring) => ring.removing).length,
    mouseAim: {
      x: game.mouseAim.x,
      y: game.mouseAim.y,
      targetX: game.mouseAim.targetX,
      targetY: game.mouseAim.targetY,
    },
    assets: {
      playerModel: Boolean(game.bird.model),
      enemyModel: game.enemies.some((enemy) => Boolean(enemy.model)),
      hdri: Boolean(game.scene.environment),
      kenneyDecor: game.decor.length,
    },
    gamepad: {
      connected: game.gamepad.connected,
      id: game.gamepad.id,
      mapping: game.gamepad.mapping,
      axes: game.gamepad.axes,
      buttons: game.gamepad.buttons.slice(0, 8),
      normalized: game.gamepad.inputState,
    },
    errors: [...game.state.errors],
  };
}
