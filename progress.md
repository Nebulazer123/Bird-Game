Original prompt: no no no not mouth movement, i meant MOUSE movement. lik ehe faces wherever my cursor is

- Replaced webcam-based mouth aim with cursor-relative mouse aim.
- Kept `W` / `S` for forward-back and `A` / `D` for left-right strafe with no inversion.
- Removed MediaPipe UI and dependency and refreshed `pnpm-lock.yaml`.
- Added a favicon to eliminate the 404 console error during automated runs.
- Verification passed: `pnpm build`, `pnpm test`, and a live local Playwright inspection with mouse aim screenshot review.
- Note: the `develop-web-game` client script could not be executed directly because it resolves `playwright` from the skill folder on this Windows setup; used the local Playwright browser tools instead.

## Combat + UI overhaul

- Removed pulse gameplay/UI wiring from flight loop and HUD.
- Added left-click beak shooting with visible projectiles, cooldown, enemy hit detection, and projectile cleanup.
- Added a slow enemy NPC with orbit movement, attack shots, kill/respawn cycle, and debug controls.
- Added player health + damage + respawn-on-death behavior while preserving mission progress.
- Reworked ring clear logic to use a wider segment-plane pass check for active-ring reliability.
- Added `Esc` pause overlay/menu and backquote debug panel with live telemetry/actions.
- Removed the mouse settings/status box and replaced with combat-focused status block.
- Updated debug hooks (`window.__birdSongDebug`) and `window.render_game_to_text` payload for combat/pause state.
- Replaced Playwright tests with 5 scenarios: ring pass, shooting damage, enemy damage/respawn, pause freeze/resume, scripted completion.
- Verification: `pnpm build` and `pnpm test` both pass; manual browser run confirms shooting + pause flow and no runtime errors.

- Started stage-loop refactor: replaced HUD shell with feathers card, Tab skill tree, finish flow, and God Mode debug control.

- Began dynamic stage-core refactor in game loop: added stage state, skill definitions, dynamic course generation, nest glow scaffolding, enemy wave scaffolding, and stage reset path.

- Wired in stage generation, skill tree UI hooks, ring confirmation state, finale nest state, multi-enemy wave support, and ground-touch death handling. Pending build/test cleanup and Playwright rewrite.

- Build and rewritten Playwright suite now pass against the stage loop, finale flow, ring confirmation, feathers, and God Mode.

- Final validation: pnpm build and pnpm test passing after stage progression, skills, feathers, finale wave, God Mode, and ring guidance changes. Skill client still cannot resolve playwright from the global skill folder on this Windows setup; fallback visual inspection used with Playwright browser tools and screenshots in output/.

## Debug menu visibility + artifact validation

- Fixed debug panel viewport bug by explicitly positioning `.debug-panel` and adding layering/overflow constraints so it stays on-screen when opened.
- Simplified debug action labels and added a new `+ Skill` debug button (`data-role="debug-add-skill"`).
- Wired `+ Skill` through a shared `giveSkillPoint()` game method and reused it from `window.__birdSongDebug.giveSkillPoint(...)`.
- Extended Playwright regression coverage to validate panel viewport bounds and all debug actions (Restart, Auto Fly, Spawn Enemy, God Mode, + Skill).
- Added `tests/capture-debug-menu-artifact.js` and script `npm run artifact:debug-menu` to produce `output/debug-menu-open-fixed.png` and `output/debug-menu-open-fixed.json` with acceptance checks.
- Verification complete: `npm test` passes (6/6), artifact JSON reports `"accepted": true`, and screenshot confirms visible menu/actions.

## Graphics upgrade pass

- Added `scripts/fetch_assets.ps1` plus `corepack pnpm assets:fetch` to download local player/enemy bird models, a Poly Haven HDRI, and Kenney Nature Kit props into `public/assets/`.
- Added `src/gameAssets.js` for cached GLB/HDR loading and wired the game to swap in an animated player bird, an animated enemy bird, HDRI reflections, and Kenney tree/rock/foliage props while keeping procedural fallback meshes.
- Added a debug-only `Showcase` mode so the player and enemy stay on screen for troubleshooting and Playwright artifact capture without needing to fly to them.
- Polished the HUD and overlays toward a more human/mobile-game tone, and improved mobile layout behavior in `src/style.css`.
- Added `tests/capture-graphics-showcase-artifact.js`, script `corepack pnpm artifact:graphics-showcase`, and Playwright coverage for showcase-mode asset visibility.
- Verification complete: `corepack pnpm build`, `corepack pnpm test` (7/7), and `corepack pnpm artifact:graphics-showcase` all pass. Artifact JSON reports `"accepted": true`.

## Zen-first polish pass

- Reinforced Zen-first UX in HUD flow: stronger directional warning language, directional damage indicator, and calmer auto-collapsing side panels during low-risk Zen flight.
- Improved controller support defaults by adding layout detection, automatic safe remap selection per device mapping, and clearer in-HUD controller guidance text.
- Upgraded temporary audio from simple sine placeholders to a richer procedural layer (wind ambience, flap/boost/warning/territory cues, optional wind-gate cue, compose chime, and harmonic note pickup tones).
- Expanded Zen optional gate behavior so wind gates now contribute a musical loop (`windGatesPassed` tracking + periodic phrase reinforcement) without reintroducing Challenge-first progression.
- Extended debug/readability state output and Playwright coverage with two additional Zen tests:
  - optional wind-gate loop behavior
  - directional hit feedback + calm-flight panel declutter checks
