/**
 * @module main
 * Application entry point for Featherwind Valley.
 * Injects the full game shell HTML into the #app element, queries all
 * data-role references, and hands them to BirdGame before starting the loop.
 * Keeping the DOM structure here makes it easy to add or rename UI elements
 * without touching game logic.
 */
import './style.css';
import { BirdGame } from './game.js';
import { BIRD_PROFILES } from './gameplay/core/config.js';

const app = document.querySelector('#app');

const birdCardsHtml = Object.values(BIRD_PROFILES).map((profile) => `
  <button class="bird-card${profile.recommended ? ' is-active' : ''}" type="button"
          data-bird="${profile.id}" aria-pressed="${profile.recommended}">
    <span class="bird-card-name">${profile.name}${profile.recommended ? ' <em class="bird-badge">recommended</em>' : ''}</span>
    <span class="bird-card-tagline">${profile.tagline}</span>
  </button>
`).join('');

app.innerHTML = `
  <main class="game-shell">
    <canvas class="game-canvas" aria-label="Featherwind Valley"></canvas>

    <section class="hud top-bar" data-role="top-bar">
      <div class="title-block" data-role="title-block">
        <p class="eyebrow">Featherwind Valley</p>
        <h1>Challenge Flight</h1>
        <p class="subtitle">Clear the wind gates, earn upgrades, and secure the Sun Nest.</p>
      </div>
      <div class="stat-strip">
        <article class="glass-card compact objective-card" data-role="objective-chip">
          <span class="label" data-role="mode-badge">Challenge Flight</span>
          <strong data-role="mission">Gate 1 / 12</strong>
          <p class="chip-copy" data-role="objective-hint">Ride the next wind gate cleanly.</p>
        </article>
        <article class="glass-card compact note-card is-hidden" data-role="note-card">
          <span class="label">Songs</span>
          <strong data-role="note-progress">0 / 9</strong>
        </article>
        <article class="glass-card compact ring-card" data-role="ring-card">
          <span class="label">Gates</span>
          <strong data-role="rings">0 / 12</strong>
        </article>
        <article class="glass-card compact">
          <span class="label">Feathers</span>
          <strong data-role="feathers">0</strong>
        </article>
        <article class="glass-card compact skill-card" data-role="skill-card">
          <span class="label">Skill Points</span>
          <strong data-role="skills">0</strong>
        </article>
      </div>
    </section>

    <section class="hud side-panel left-panel" data-role="left-panel">
      <article class="glass-card">
        <span class="label">Flight Notes</span>
        <p>Move with <kbd>W</kbd><kbd>S</kbd><kbd>A</kbd><kbd>D</kbd> or a controller.</p>
        <p>Steer with the mouse or right stick.</p>
        <p><kbd>Space</kbd> flap upward.</p>
        <p><kbd>F</kbd> gust burst.</p>
        <p><kbd>Mouse1</kbd> or <kbd>Q</kbd> beak shot.</p>
      </article>
    </section>

    <section class="hud side-panel right-panel" data-role="right-panel">
      <article class="glass-card">
        <span class="label">Flight Feel</span>
        <strong class="big-stat" data-role="speed">0 mph</strong>
        <div class="meter-row">
          <span>Gust</span>
          <div class="meter"><div data-role="boost-fill"></div></div>
        </div>
        <div class="meter-row">
          <span>Action</span>
          <div class="meter"><div data-role="fire-fill"></div></div>
        </div>
      </article>
      <article class="glass-card">
        <span class="label">Status</span>
        <p><strong data-role="health">100 / 100</strong> HP</p>
        <p data-role="aim">Mouse aim active</p>
        <p data-role="enemy">Hunter reforming</p>
        <p data-role="control-hint">Controller: connect to enable.</p>
      </article>
    </section>

    <section class="flight-overlay">
      <div class="threat-indicator is-hidden" data-role="threat-indicator" aria-hidden="true"></div>
      <div class="damage-indicator is-hidden" data-role="damage-indicator" aria-hidden="true"></div>
      <div class="ground-warning is-hidden" data-role="ground-warning"></div>

      <div class="reticle-stack">
        <div class="reticle-ring boost-ring" data-role="boost-ring"></div>
        <div class="reticle-ring fire-ring" data-role="fire-ring"></div>
        <div class="reticle" data-role="reticle" aria-hidden="true"></div>
      </div>

      <aside class="survival-widget glass-card" data-role="survival-widget">
        <span class="label">Danger</span>
        <strong data-role="danger-label">Clear sky</strong>
      </aside>

      <div class="tutorial-prompt is-hidden" data-role="tutorial-prompt"></div>
    </section>

    <button id="debug-open" class="debug-toggle" type="button" data-role="debug-open">Debug</button>

    <section class="overlay start-overlay" data-role="start-overlay">
      <div class="overlay-card start-card">
        <p class="eyebrow">Choose your bird</p>
        <h2>Pick a companion</h2>
        <p class="overlay-copy">Each bird has a different flying style. You can change later from the debug menu.</p>
        <div class="bird-grid">${birdCardsHtml}</div>
        <div class="start-detail">
          <strong data-role="selected-bird-name">Parrot</strong>
          <p data-role="selected-bird-summary">Steady speed, steady health, and no sharp weaknesses.</p>
        </div>
        <div class="pause-actions">
          <button type="button" class="primary-button" data-role="start-flight">Start Flight</button>
        </div>
      </div>
    </section>

    <section class="overlay skill-overlay is-hidden" data-role="skill-overlay">
      <div class="overlay-card skill-card">
        <p class="eyebrow">Challenge Upgrades</p>
        <h2>Pick 1 upgrade</h2>
        <p class="overlay-copy" data-role="skill-copy">Spend 1 Skill Point. Press <kbd>Tab</kbd> to close.</p>
        <div class="skill-columns">
          <div class="skill-branch">
            <h3>Offense</h3>
            <button class="skill-node" type="button" data-skill="rapidBeak">
              <strong>Rapid Beak</strong>
              <span>Faster beak-shot cooldown.</span>
            </button>
            <button class="skill-node" type="button" data-skill="piercingShot">
              <strong>Piercing Shot</strong>
              <span>Shots punch through a target and hit harder.</span>
            </button>
          </div>
          <div class="skill-branch">
            <h3>Flight</h3>
            <button class="skill-node" type="button" data-skill="tailwind">
              <strong>Tailwind</strong>
              <span>Higher cruise speed and stronger dash.</span>
            </button>
            <button class="skill-node" type="button" data-skill="skyGrip">
              <strong>Sky Grip</strong>
              <span>Sharper yaw and tighter pitch control.</span>
            </button>
          </div>
          <div class="skill-branch">
            <h3>Survival</h3>
            <button class="skill-node" type="button" data-skill="shellGuard">
              <strong>Shell Guard</strong>
              <span>More maximum health and softer enemy hits.</span>
            </button>
            <button class="skill-node" type="button" data-skill="rebirthDraft">
              <strong>Rebirth Draft</strong>
              <span>Shorter respawn recovery with brief spawn shielding.</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="overlay finish-overlay is-hidden" data-role="finish-overlay">
      <div class="overlay-card finish-card">
        <p class="eyebrow">Flight Summary</p>
        <h2>Nest secured</h2>
        <p class="overlay-copy" data-role="finish-summary">Skill point added.</p>
        <div class="pause-actions">
          <button type="button" class="primary-button" data-role="open-skills">Pick Upgrade</button>
          <button type="button" class="primary-button secondary-tone" data-role="restart-button">Fly Again</button>
        </div>
      </div>
    </section>

    <section class="overlay pause-overlay is-hidden" data-role="pause-overlay">
      <div class="overlay-card pause-card">
        <p class="eyebrow">Paused</p>
        <h2>Take a breath</h2>
        <p class="overlay-copy">Resume to keep gliding, or restart from the valley entrance.</p>
        <div class="pause-actions">
          <button type="button" class="primary-button" data-role="pause-resume">Resume</button>
          <button type="button" class="primary-button secondary-tone" data-role="pause-restart">Run Again</button>
        </div>
      </div>
    </section>

    <aside class="debug-panel is-hidden" data-role="debug-panel">
      <div class="debug-header">
        <strong>Debug</strong>
        <span><kbd>\`</kbd> toggle</span>
      </div>
      <div class="tuning-pane" data-role="tuning-mount"></div>
      <pre data-role="debug-state"></pre>
      <div class="debug-actions">
        <button type="button" data-role="debug-reset">Restart</button>
        <button type="button" data-role="debug-autopilot">Auto Fly</button>
        <button type="button" data-role="debug-showcase">Showcase</button>
        <button type="button" data-role="debug-respawn-enemy">Spawn Enemy</button>
        <button type="button" data-role="debug-territory">Territory</button>
        <button type="button" data-role="debug-god-mode">God Mode</button>
        <button type="button" data-role="debug-add-skill">+ Skill</button>
      </div>
    </aside>
  </main>
`;

const root = app.querySelector('.game-shell');

// Build a map of all data-role UI elements and pass them to BirdGame.
// Using data-role attributes decouples CSS class names from JavaScript lookups.
const game = new BirdGame({
  root,
  canvas: root.querySelector('.game-canvas'),
  topBar: root.querySelector('[data-role="top-bar"]'),
  leftPanel: root.querySelector('[data-role="left-panel"]'),
  rightPanel: root.querySelector('[data-role="right-panel"]'),
  mission: root.querySelector('[data-role="mission"]'),
  objectiveChip: root.querySelector('[data-role="objective-chip"]'),
  objectiveHint: root.querySelector('[data-role="objective-hint"]'),
  modeBadge: root.querySelector('[data-role="mode-badge"]'),
  noteCard: root.querySelector('[data-role="note-card"]'),
  ringCard: root.querySelector('[data-role="ring-card"]'),
  noteProgress: root.querySelector('[data-role="note-progress"]'),
  rings: root.querySelector('[data-role="rings"]'),
  feathers: root.querySelector('[data-role="feathers"]'),
  skills: root.querySelector('[data-role="skills"]'),
  speed: root.querySelector('[data-role="speed"]'),
  health: root.querySelector('[data-role="health"]'),
  aim: root.querySelector('[data-role="aim"]'),
  enemy: root.querySelector('[data-role="enemy"]'),
  controlHint: root.querySelector('[data-role="control-hint"]'),
  dangerLabel: root.querySelector('[data-role="danger-label"]'),
  survivalWidget: root.querySelector('[data-role="survival-widget"]'),
  threatIndicator: root.querySelector('[data-role="threat-indicator"]'),
  damageIndicator: root.querySelector('[data-role="damage-indicator"]'),
  groundWarning: root.querySelector('[data-role="ground-warning"]'),
  tutorialPrompt: root.querySelector('[data-role="tutorial-prompt"]'),
  reticle: root.querySelector('[data-role="reticle"]'),
  boostRing: root.querySelector('[data-role="boost-ring"]'),
  fireRing: root.querySelector('[data-role="fire-ring"]'),
  boostFill: root.querySelector('[data-role="boost-fill"]'),
  fireFill: root.querySelector('[data-role="fire-fill"]'),
  skillCard: root.querySelector('[data-role="skill-card"]'),
  skillOverlay: root.querySelector('[data-role="skill-overlay"]'),
  skillCopy: root.querySelector('[data-role="skill-copy"]'),
  finishOverlay: root.querySelector('[data-role="finish-overlay"]'),
  finishSummary: root.querySelector('[data-role="finish-summary"]'),
  openSkillsButton: root.querySelector('[data-role="open-skills"]'),
  restartButton: root.querySelector('[data-role="restart-button"]'),
  pauseOverlay: root.querySelector('[data-role="pause-overlay"]'),
  pauseResumeButton: root.querySelector('[data-role="pause-resume"]'),
  pauseRestartButton: root.querySelector('[data-role="pause-restart"]'),
  startOverlay: root.querySelector('[data-role="start-overlay"]'),
  startFlightButton: root.querySelector('[data-role="start-flight"]'),
  selectedBirdName: root.querySelector('[data-role="selected-bird-name"]'),
  selectedBirdSummary: root.querySelector('[data-role="selected-bird-summary"]'),
  birdButtons: [...root.querySelectorAll('[data-bird]')],
  debugPanel: root.querySelector('[data-role="debug-panel"]'),
  tuningMount: root.querySelector('[data-role="tuning-mount"]'),
  debugState: root.querySelector('[data-role="debug-state"]'),
  debugResetMission: root.querySelector('[data-role="debug-reset"]'),
  debugToggleAutopilot: root.querySelector('[data-role="debug-autopilot"]'),
  debugShowcaseToggle: root.querySelector('[data-role="debug-showcase"]'),
  debugRespawnEnemy: root.querySelector('[data-role="debug-respawn-enemy"]'),
  debugTerritoryButton: root.querySelector('[data-role="debug-territory"]'),
  debugGodMode: root.querySelector('[data-role="debug-god-mode"]'),
  debugAddSkill: root.querySelector('[data-role="debug-add-skill"]'),
  debugOpenButton: root.querySelector('[data-role="debug-open"]'),
  skillButtons: [...root.querySelectorAll('[data-skill]')],
});

// Start the Three.js animation loop; the engine ticks from here.
game.start();
