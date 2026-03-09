import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const OUTPUT_DIR = path.resolve('output');
const SCREENSHOT_PATH = path.join(OUTPUT_DIR, 'zen-readability.png');
const JSON_PATH = path.join(OUTPUT_DIR, 'zen-readability.json');
const BASE_URL = process.env.READABILITY_URL || 'http://127.0.0.1:4187';

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Wait for the dev server.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function capture() {
  let serverProcess = null;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    const serverReady = await waitForServer(BASE_URL, 1500);
    if (!serverReady) {
      serverProcess = spawn('corepack', ['pnpm', 'dev', '--host', '127.0.0.1', '--port', '4187'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'ignore',
      });

      const started = await waitForServer(BASE_URL);
      if (!started) {
        throw new Error('Vite server did not start in time for readability artifact capture.');
      }
    }

    await page.goto(BASE_URL);
    await page.waitForFunction(() => window.__birdSongReady === true);
    await page.evaluate(() => {
      window.__birdSongDebug.setMode('zen');
      window.__birdSongDebug.spawnTerritoryMoment();
      window.__birdSongDebug.hitPlayer(12);
      window.advanceTime(120);
    });

    const objective = page.locator('[data-role="objective-chip"]');
    const danger = page.locator('[data-role="danger-label"]');
    const threat = page.locator('[data-role="threat-indicator"]');
    const rings = page.locator('[data-role="boost-ring"]');

    await objective.waitFor({ state: 'visible' });
    await rings.waitFor({ state: 'visible' });

    const state = await page.evaluate(() => ({
      debug: window.__birdSongDebug.getState(),
      text: JSON.parse(window.render_game_to_text()),
      mission: document.querySelector('[data-role="mission"]').textContent,
      danger: document.querySelector('[data-role="danger-label"]').textContent,
    }));

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

    const artifact = {
      url: BASE_URL,
      screenshot: path.basename(SCREENSHOT_PATH),
      sliceMode: state.debug.mode,
      mission: state.mission,
      danger: state.danger,
      notesCollected: state.debug.zenNotesCollected,
      threatVisible: await threat.isVisible(),
      objectiveVisible: await objective.isVisible(),
      abilityRingsVisible: await rings.isVisible(),
      consoleErrors,
      accepted: false,
    };

    artifact.accepted = (
      artifact.sliceMode === 'zen'
      && artifact.objectiveVisible
      && artifact.abilityRingsVisible
      && artifact.threatVisible
      && artifact.danger.length > 0
      && artifact.consoleErrors.length === 0
    );

    fs.writeFileSync(JSON_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
    if (!artifact.accepted) {
      throw new Error('Zen readability artifact validation failed. See output/zen-readability.json');
    }
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

capture().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
