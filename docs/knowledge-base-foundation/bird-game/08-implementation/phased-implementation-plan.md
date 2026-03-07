# Bird Game — Implementation Artifact (What We Actually Built)

Date: 2026-03-07

This is a clean summary of the **Zen Soarer vertical slice implementation** that was actually shipped into the repo, based on the locked specialist outputs in:
- `docs/knowledge-base-foundation/bird-game/02-research/`
- `docs/knowledge-base-foundation/bird-game/04-architecture/`
- `docs/knowledge-base-foundation/bird-game/06-tooling-scout/`
- `docs/knowledge-base-foundation/bird-game/07-ui-ux/`

## What Changed
- Added **slice modes**: `zen` (default) and `challenge` (legacy loop preserved).
- Implemented **Zen discovery loop**: collect 9 “song notes” placed in the valley and **compose at the nest** to finish.
- Reframed rings/wind gates as **non-spine** in Zen (rings are hidden in Zen; the old ring mission remains in Challenge).
- Added **optional “territory moment”** encounters intended to be short and skippable (Zen does not fire enemy projectiles).
- Implemented **Wind Pulse** as the main Zen “action” (mouse click or `Q`), replacing shooter combat identity in Zen.
- Added tooling foundations from the scout:
  - **Tweakpane** embedded into the debug panel for tuning.
  - **Howler** audio scaffold (prototype sounds generated in code so the build is self-contained).
  - **Gamepad API** input normalizer + diagnostics (controller-ready path).
- Updated HUD toward the UI/UX spec direction (center-weighted cues and contextual danger), without attempting the full final HUD spec yet.
- Updated Playwright coverage to explicitly boot into `zen` or `challenge` per test.
- Added a new “readability moment” artifact capture script.

## What Was Chosen (Locked Calls Implemented)
- **Zen Soarer first**: Zen is now the default experience mode.
- **Rings/wind gates are side activity**: the ring-driven mission loop is kept as Challenge mode.
- **Combat does not dominate**:
  - Zen mode disables projectile combat and uses Wind Pulse + optional pressure encounters.
  - Challenge mode keeps existing ring + projectile combat behavior for regression protection.
- **Incremental refactor, not restart**: all new behavior was added through the existing `src/gameplay/**` systems architecture.
- **Controller-ready architecture**: Gamepad API input normalizer is implemented and visible in debug diagnostics.

## What Was Kept (Intentionally Preserved)
- Public entry and overall app wiring:
  - `src/main.js` still constructs `new BirdGame({...})`.
  - `src/game.js` remains the stable entry point (scene construction stays here).
- Debug/test contract (still present and expanded):
  - `window.__birdSongDebug`
  - `window.advanceTime(ms)`
  - `window.render_game_to_text()`
  - `window.__birdSongReady`
- Existing assets boundary: `src/gameAssets.js`.
- Existing Challenge loop systems:
  - rings/stage/finale behavior (Challenge mode)
  - projectile combat (Challenge mode)
- Existing artifact pipeline patterns (now extended with readability capture).

## What Was Deferred (Deliberately Not Done Yet)
- Real audio assets and licensing tracking inside the build:
  - We used synthesized WAV data URIs to validate timing/roles first.
  - Replace with real wind/SFX files later and track sources/licenses as the scout recommends.
- Full UI/UX spec completeness:
  - The HUD moved toward center-weighted cues, but still has legacy panels.
  - Damage direction and threat edge language can be pushed further.
- Music gates as a dedicated “side activity” system (notes are currently collected from discovery meshes, not gates).
- Polished controller UX:
  - No on-screen controller button glyphs/prompts.
  - No remapping UI (only a small remap structure + localStorage persistence hooks).
- WebKit smoke coverage (optional) and performance/code-splitting cleanup (Vite chunk warning remains).

## Test and Build Results
All verified locally after implementation:
- `corepack pnpm test` passes (9 tests).
- `corepack pnpm build` passes.
- `corepack pnpm artifact:readability` passes and writes:
  - `output/zen-readability.png`
  - `output/zen-readability.json`

## Key Files (Implementation Anchors)
- Modes, tuning, Zen state, debug hooks integration: `src/game.js`
- Zen discovery: `src/gameplay/zen/zenDiscoverySystem.js`
- Zen composition/end condition: `src/gameplay/zen/zenCompletionSystem.js`
- Audio scaffold (Howler): `src/gameplay/audio/audioSystem.js`
- Gamepad normalizer (Web Gamepad API): `src/gameplay/input/gamepadSystem.js`
- Tweakpane debug UI: `src/gameplay/debug/tuningPane.js`
- HUD behavior: `src/gameplay/ui/hudSystem.js`
- UI bindings: `src/gameplay/ui/bindings.js`
- Debug bridge for tests: `src/gameplay/debug/debugBridge.js`
- Tests: `tests/game.spec.js`
- Readability artifact: `tests/capture-readability-artifact.js`

## Next Implementation Steps (Concrete)
1. Make “wind-as-instrument” more literal:
   - Replace synthesized tones with real chimes and a wind bed.
   - Add a small in-repo license/source log for audio assets (Kenney/Freesound/etc.).
2. Turn rings into true optional “music gates” in Zen:
   - Gate pass plays a note and optionally grants a small gust.
   - Add an opt-in time trial route as a separate activity, not the mission.
3. Push the UI/UX spec further:
   - Damage direction indicator (short-lived, unmistakable).
   - Incoming threat directional language (edge wedge) for Challenge mode projectiles.
   - Reduce persistent panel clutter during flight (leave panels for pause/debug).
4. Controller polish pass:
   - Decide the final mapping, add on-screen prompts, and tighten deadzone/smoothing.
5. Expand regression protection:
   - Add 2–3 more readability artifact captures (high-speed turn, low altitude, territory moment).
   - Optional: add Playwright WebKit smoke project.

