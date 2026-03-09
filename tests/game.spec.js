import { expect, test } from '@playwright/test';

async function boot(page, mode = 'challenge', birdId = 'parrot') {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('/');
  await page.waitForFunction(() => window.__birdSongReady === true);
  await page.evaluate(({ requestedMode, requestedBird }) => {
    window.__birdSongDebug.startRun(requestedBird);
    window.__birdSongDebug.setMode(requestedMode);
  }, { requestedMode: mode, requestedBird: birdId });
  return { pageErrors, consoleErrors };
}

test('rings award feathers and captured rings disappear after confirmation pop', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const result = await page.evaluate(() => {
    const start = window.__birdSongDebug.getState();
    for (let index = 0; index < 4; index += 1) {
      window.__birdSongDebug.passActiveRing();
    }
    const mid = window.__birdSongDebug.getState();
    window.advanceTime(400);
    const end = window.__birdSongDebug.getState();
    return { start, mid, end, text: JSON.parse(window.render_game_to_text()) };
  });

  expect(result.mid.ringsCleared).toBe(4);
  expect(result.mid.feathers).toBe(1);
  expect(result.mid.capturingRingCount).toBeGreaterThan(0);
  expect(result.end.visibleRingCount).toBe(result.start.totalRings - 4);
  expect(result.text.progress.feathers).toBe(1);
  expect(result.end.errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('three beak shots kill the enemy and it respawns later', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const outcome = await page.evaluate(() => {
    window.__birdSongDebug.forceEnemyInFront();
    window.__birdSongDebug.setEnemyHealth(3);
    window.__birdSongDebug.fire();
    window.advanceTime(50);
    const afterFire = window.__birdSongDebug.getState();
    window.__birdSongDebug.hitEnemy(1);
    window.__birdSongDebug.hitEnemy(1);
    window.__birdSongDebug.hitEnemy(1);
    const downed = window.__birdSongDebug.getState();
    window.advanceTime(6000);
    const respawned = window.__birdSongDebug.getState();
    return { afterFire, downed, respawned };
  });

  expect(outcome.afterFire.playerBullets).toBeGreaterThan(0);
  expect(outcome.downed.enemyAlive).toBeFalsy();
  expect(outcome.downed.enemyHealth).toBeLessThanOrEqual(0);
  expect(outcome.respawned.enemyAlive).toBeTruthy();
  expect(outcome.respawned.enemyHealth).toBe(3);
  expect(outcome.respawned.primaryEnemyPosition).not.toEqual(outcome.downed.primaryEnemyPosition);
  expect(outcome.respawned.errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('finale activates nest glow and skill selection advances to a harder stage', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const flow = await page.evaluate(() => {
    const before = window.__birdSongDebug.getState();
    window.__birdSongDebug.clearRings();
    window.advanceTime(250);
    const finale = window.__birdSongDebug.getState();
    window.__birdSongDebug.landInNest();
    window.advanceTime(300);
    const complete = window.__birdSongDebug.getState();
    const textAtWin = JSON.parse(window.render_game_to_text());
    window.__birdSongDebug.selectSkill('rapidBeak');
    window.advanceTime(100);
    const advanced = window.__birdSongDebug.getState();
    return { before, finale, complete, advanced, textAtWin };
  });

  expect(flow.finale.finaleActive).toBeTruthy();
  expect(flow.finale.nestGlow).toBeTruthy();
  expect(flow.finale.eggsVisible).toBe(3);
  expect(flow.finale.enemyWave).toBe('finale');
  expect(flow.finale.enemyCount).toBe(3);
  expect(flow.complete.completed).toBeTruthy();
  expect(flow.complete.pendingStageAdvance).toBeTruthy();
  expect(flow.complete.skillPoints).toBe(1);
  expect(flow.textAtWin.finale.active).toBeTruthy();
  expect(flow.advanced.stage).toBe(flow.before.stage + 1);
  expect(flow.advanced.totalRings).toBe(flow.before.totalRings + 3);
  expect(flow.advanced.unlockedSkills.rapidBeak).toBeTruthy();
  expect(flow.advanced.skillPoints).toBe(0);
  expect(flow.advanced.errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('god mode blocks both attack death and ground-touch death', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const states = await page.evaluate(() => {
    const start = window.__birdSongDebug.getState();
    window.__birdSongDebug.toggleGodMode(true);
    window.__birdSongDebug.hitPlayer(999);
    const afterHit = window.__birdSongDebug.getState();
    const touched = window.__birdSongDebug.forceGroundTouch();
    window.advanceTime(700);
    const afterGround = window.__birdSongDebug.getState();
    return { start, afterHit, touched, afterGround };
  });

  expect(states.afterHit.health).toBe(states.start.health);
  expect(states.touched).toBeFalsy();
  expect(states.afterGround.playerDeaths).toBe(states.start.playerDeaths);
  expect(states.afterGround.health).toBe(states.start.health);
  expect(states.afterGround.godMode).toBeTruthy();
  expect(states.afterGround.errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('pause menu still freezes travel and resumes cleanly', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const before = await page.evaluate(() => window.__birdSongDebug.getState());
  await page.keyboard.press('Escape');
  await page.keyboard.down('w');
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  const paused = await page.evaluate(() => window.__birdSongDebug.getState());

  await page.keyboard.press('Escape');
  await page.keyboard.down('w');
  await page.waitForTimeout(400);
  await page.keyboard.up('w');
  const resumed = await page.evaluate(() => window.__birdSongDebug.getState());

  expect(paused.paused).toBeTruthy();
  expect(Math.abs(paused.birdPosition[2] - before.birdPosition[2])).toBeLessThan(0.5);
  expect(resumed.paused).toBeFalsy();
  expect(resumed.birdPosition[2]).not.toBeCloseTo(paused.birdPosition[2], 1);
  expect(resumed.errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('debug menu appears in viewport and debug actions work', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const debugButton = page.locator('#app > main > button');
  await expect(debugButton).toHaveText('Debug');
  await debugButton.click();

  const panel = page.locator('[data-role="debug-panel"]');
  await expect(panel).toBeVisible();

  const panelBox = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(panelBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(panelBox.y).toBeGreaterThanOrEqual(0);
  expect(panelBox.x).toBeGreaterThanOrEqual(0);
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height);
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width);

  await page.evaluate(() => {
    window.__birdSongDebug.passActiveRing();
  });
  await page.locator('[data-role="debug-reset"]').click();
  const afterReset = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterReset.ringsCleared).toBe(0);
  expect(afterReset.activeRingIndex).toBe(0);

  await page.locator('[data-role="debug-autopilot"]').click();
  const autoFlyOn = await page.evaluate(() => window.__birdSongDebug.getState().autopilot);
  expect(autoFlyOn).toBeTruthy();
  await page.locator('[data-role="debug-autopilot"]').click();
  const autoFlyOff = await page.evaluate(() => window.__birdSongDebug.getState().autopilot);
  expect(autoFlyOff).toBeFalsy();

  await page.evaluate(() => {
    window.__birdSongDebug.hitEnemy(99);
    window.advanceTime(80);
  });
  await page.locator('[data-role="debug-respawn-enemy"]').click();
  const afterSpawn = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterSpawn.enemyAlive).toBeTruthy();
  expect(afterSpawn.enemyCount).toBeGreaterThan(0);

  await page.locator('[data-role="debug-god-mode"]').click();
  const godModeOn = await page.evaluate(() => window.__birdSongDebug.getState().godMode);
  expect(godModeOn).toBeTruthy();
  await page.locator('[data-role="debug-god-mode"]').click();
  const godModeOff = await page.evaluate(() => window.__birdSongDebug.getState().godMode);
  expect(godModeOff).toBeFalsy();

  const beforeSkill = await page.evaluate(() => window.__birdSongDebug.getState().skillPoints);
  await page.locator('[data-role="debug-add-skill"]').click();
  const afterSkill = await page.evaluate(() => window.__birdSongDebug.getState().skillPoints);
  expect(afterSkill).toBe(beforeSkill + 1);

  const debugText = await page.locator('[data-role="debug-state"]').textContent();
  expect(debugText).toContain('"input"');
  expect(debugText).toContain('"normalized"');

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('spawn hover holds altitude until keyboard movement and wheel zoom changes POV', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  const start = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(start.awaitingTakeoff).toBeTruthy();

  await page.evaluate(() => {
    window.advanceTime(2000);
  });
  const afterHover = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterHover.awaitingTakeoff).toBeTruthy();
  expect(Math.abs(afterHover.birdPosition[1] - start.birdPosition[1])).toBeLessThan(0.7);

  const cameraDistanceBefore = afterHover.cameraDistance;
  await page.mouse.wheel(0, 500);
  await page.evaluate(() => window.advanceTime(250));
  const afterZoomOut = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterZoomOut.cameraDistance).toBeGreaterThan(cameraDistanceBefore);

  await page.keyboard.down('w');
  await page.evaluate(() => window.advanceTime(500));
  await page.keyboard.up('w');
  const afterMove = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterMove.awaitingTakeoff).toBeFalsy();
  expect(afterMove.speed).toBeGreaterThan(0);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('showcase mode exposes loaded player and enemy graphics for artifact capture', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge');

  await page.locator('[data-role="debug-open"]').click();
  await page.locator('[data-role="debug-showcase"]').click();

  await page.waitForFunction(() => {
    const assets = window.__birdSongDebug.getAssets();
    return assets.playerModel && assets.enemyModel && assets.hdri;
  });

  const state = await page.evaluate(() => ({
    debug: window.__birdSongDebug.getState(),
    assets: window.__birdSongDebug.getAssets(),
    text: JSON.parse(window.render_game_to_text()),
  }));

  expect(state.debug.showcaseMode).toBeTruthy();
  expect(state.assets.playerModel).toBeTruthy();
  expect(state.assets.enemyModel).toBeTruthy();
  expect(state.assets.hdri).toBeTruthy();
  expect(state.text.mode).toBe('showcase');
  expect(state.text.combat.enemyCount).toBeGreaterThan(0);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('zen mode collects a note, updates the objective chip, and composes at the nest', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'zen');

  const zenState = await page.evaluate(() => {
    const start = window.__birdSongDebug.getState();
    window.__birdSongDebug.collectZenNote('note-1');
    const afterCollect = window.__birdSongDebug.getState();
    for (let index = 2; index <= afterCollect.zenNotesTotal; index += 1) {
      window.__birdSongDebug.collectZenNote(`note-${index}`);
    }
    window.__birdSongDebug.landInNest();
    window.advanceTime(250);
    window.__birdSongDebug.composeZenSong();
    return {
      afterCollect: window.__birdSongDebug.getState(),
      text: JSON.parse(window.render_game_to_text()),
      mission: document.querySelector('[data-role="mission"]').textContent,
      start,
    };
  });

  expect(zenState.afterCollect.mode).toBe('zen');
  expect(zenState.afterCollect.zenNotesCollected).toBe(zenState.afterCollect.zenNotesTotal);
  expect(zenState.afterCollect.zenComposed).toBeTruthy();
  expect(zenState.text.progress.notesCollected).toBeGreaterThan(0);
  expect(zenState.mission).toContain('Song composed');
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('bird picker shows all 4 birds and selecting one updates state', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('/');
  await page.waitForFunction(() => window.__birdSongReady === true);

  const overlay = page.locator('[data-role="start-overlay"]');
  await expect(overlay).toBeVisible();

  const birdButtons = page.locator('[data-bird]');
  await expect(birdButtons).toHaveCount(4);

  const birdIds = await birdButtons.evaluateAll((buttons) => buttons.map((button) => button.dataset.bird));
  expect(birdIds).toContain('parrot');
  expect(birdIds).toContain('hummingbird');
  expect(birdIds).toContain('falcon');
  expect(birdIds).toContain('owl');

  await page.evaluate(() => {
    window.__birdSongDebug.selectBird('falcon');
  });
  const afterSelect = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterSelect.selectedBirdId).toBe('falcon');

  await page.evaluate(() => {
    window.__birdSongDebug.startRun('falcon');
  });
  const afterStart = await page.evaluate(() => window.__birdSongDebug.getState());
  expect(afterStart.selectedBirdId).toBe('falcon');

  await expect(overlay).toBeHidden();
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('hummingbird selection shows higher agility stats than parrot', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'challenge', 'hummingbird');

  const comparison = await page.evaluate(() => {
    const hummingbirdStats = window.__birdSongDebug.getStats();
    const hummingbirdState = window.__birdSongDebug.getState();
    const text = JSON.parse(window.render_game_to_text());
    return { hummingbirdStats, hummingbirdState, text };
  });

  expect(comparison.hummingbirdState.selectedBirdId).toBe('hummingbird');
  expect(comparison.text.selectedBirdId).toBe('hummingbird');
  expect(comparison.hummingbirdStats.yawRate).toBeGreaterThan(2.4);
  expect(comparison.hummingbirdStats.flapRateMultiplier).toBeGreaterThan(1.5);
  expect(comparison.hummingbirdState.errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('zen wind gates stay optional, loop continuously, and update hint copy', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'zen');

  const result = await page.evaluate(() => {
    window.__birdSongDebug.clearActiveRing();
    for (let index = 0; index < 13; index += 1) {
      window.__birdSongDebug.passActiveRing();
    }
    window.advanceTime(120);
    const state = window.__birdSongDebug.getState();
    const objectiveHint = document.querySelector('[data-role="objective-hint"]')?.textContent ?? '';
    const text = JSON.parse(window.render_game_to_text());
    return { state, objectiveHint, text };
  });

  expect(result.state.mode).toBe('zen');
  expect(result.state.ringsCleared).toBe(0);
  expect(result.state.zenWindGatesPassed).toBeGreaterThanOrEqual(13);
  expect(result.state.activeRingIndex).toBeGreaterThanOrEqual(0);
  expect(result.state.activeRingIndex).toBeLessThan(result.state.totalRings);
  expect(result.objectiveHint).toContain(`Wind gates sung: ${result.state.zenWindGatesPassed}`);
  expect(result.text.progress.windGatesPassed).toBe(result.state.zenWindGatesPassed);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('zen damage indicator shows directional hit feedback and panels auto-collapse in calm flight', async ({ page }) => {
  const { pageErrors, consoleErrors } = await boot(page, 'zen');

  const state = await page.evaluate(() => {
    window.__birdSongDebug.clearActiveRing();
    window.advanceTime(220);
    const leftCollapsed = document.querySelector('[data-role="left-panel"]')?.classList.contains('is-collapsed') ?? false;
    const rightCollapsed = document.querySelector('[data-role="right-panel"]')?.classList.contains('is-collapsed') ?? false;

    window.__birdSongDebug.spawnTerritoryMoment();
    window.__birdSongDebug.hitPlayer(12);
    window.advanceTime(110);

    const damageEl = document.querySelector('[data-role="damage-indicator"]');
    const damageVisible = damageEl ? !damageEl.classList.contains('is-hidden') : false;
    const damageOpacity = damageEl ? Number(getComputedStyle(damageEl).opacity) : 0;
    const dangerText = document.querySelector('[data-role="danger-label"]')?.textContent ?? '';
    return {
      leftCollapsed,
      rightCollapsed,
      damageVisible,
      damageOpacity,
      dangerText,
      debug: window.__birdSongDebug.getState(),
    };
  });

  expect(state.leftCollapsed).toBeTruthy();
  expect(state.rightCollapsed).toBeTruthy();
  expect(state.damageVisible).toBeTruthy();
  expect(state.damageOpacity).toBeGreaterThan(0.1);
  expect(state.dangerText).toContain('Hit from');
  expect(state.debug.health).toBeLessThan(100);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
