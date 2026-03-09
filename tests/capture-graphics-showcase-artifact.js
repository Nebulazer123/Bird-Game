import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const OUTPUT_DIR = path.resolve('output');
const SCREENSHOT_PATH = path.join(OUTPUT_DIR, 'graphics-showcase.png');
const JSON_PATH = path.join(OUTPUT_DIR, 'graphics-showcase.json');
const BASE_URL = process.env.SHOWCASE_URL || 'http://127.0.0.1:4187';

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server is still starting.
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
        throw new Error('Vite server did not start in time for graphics artifact capture.');
      }
    }

    await page.goto(BASE_URL);
    await page.waitForFunction(() => window.__birdSongReady === true);
    await page.click('[data-role="debug-open"]');
    await page.click('[data-role="debug-showcase"]');

    await page.waitForFunction(async () => {
      const assets = window.__birdSongDebug.getAssets();
      return assets.playerModel && assets.enemyModel && assets.hdri;
    }, { timeout: 20000 });

    await page.waitForTimeout(1500);

    const state = await page.evaluate(() => ({
      debug: window.__birdSongDebug.getState(),
      assets: window.__birdSongDebug.getAssets(),
      text: JSON.parse(window.render_game_to_text()),
    }));

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

    const artifact = {
      url: BASE_URL,
      screenshot: path.basename(SCREENSHOT_PATH),
      showcaseMode: state.debug.showcaseMode,
      playerModel: state.assets.playerModel,
      enemyModel: state.assets.enemyModel,
      hdri: state.assets.hdri,
      kenneyTrees: state.assets.kenney.trees,
      kenneyRocks: state.assets.kenney.rocks,
      kenneyFoliage: state.assets.kenney.foliage,
      renderMode: state.text.mode,
      enemyCount: state.text.combat.enemyCount,
      consoleErrors,
      accepted: false,
    };

    artifact.accepted = (
      artifact.showcaseMode
      && artifact.playerModel
      && artifact.enemyModel
      && artifact.hdri
      && artifact.renderMode === 'showcase'
      && artifact.enemyCount > 0
      && artifact.consoleErrors.length === 0
    );

    fs.writeFileSync(JSON_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
    if (!artifact.accepted) {
      throw new Error('Graphics showcase artifact validation failed. See output/graphics-showcase.json');
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
