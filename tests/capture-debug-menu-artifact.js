import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const OUTPUT_DIR = path.resolve('output');
const SCREENSHOT_PATH = path.join(OUTPUT_DIR, 'debug-menu-open-fixed.png');
const JSON_PATH = path.join(OUTPUT_DIR, 'debug-menu-open-fixed.json');
const BASE_URL = process.env.DEBUG_MENU_URL || 'http://127.0.0.1:4187';

function isInViewport(box, viewport) {
  if (!box || !viewport) return false;
  return (
    box.x >= 0
    && box.y >= 0
    && box.x + box.width <= viewport.width
    && box.y + box.height <= viewport.height
  );
}

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.goto(BASE_URL);
    await page.waitForFunction(() => window.__birdSongReady === true);
    await page.click('#app > main > button');

    const panel = page.locator('[data-role="debug-panel"]');
    await panel.waitFor({ state: 'visible' });

    const viewport = page.viewportSize();
    const panelBox = await panel.boundingBox();
    const beforeSkill = await page.evaluate(() => window.__birdSongDebug.getState().skillPoints);
    await page.click('[data-role="debug-add-skill"]');
    const afterState = await page.evaluate(() => window.__birdSongDebug.getState());

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

    const artifact = {
      url: BASE_URL,
      viewport,
      panelVisible: await panel.isVisible(),
      panelBox,
      inViewport: isInViewport(panelBox, viewport),
      beforeSkill,
      afterSkill: afterState.skillPoints,
      skillIncreased: afterState.skillPoints === beforeSkill + 1,
      debugOpen: afterState.debugOpen,
      consoleErrors,
      accepted: false,
    };
    artifact.accepted = (
      artifact.panelVisible
      && artifact.inViewport
      && artifact.skillIncreased
      && artifact.debugOpen
      && artifact.consoleErrors.length === 0
    );

    fs.writeFileSync(JSON_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
    if (!artifact.accepted) {
      throw new Error('Artifact validation failed. See output/debug-menu-open-fixed.json');
    }
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
