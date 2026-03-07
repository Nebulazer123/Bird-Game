# Migration Notes and Constraints

## What was preserved (intentionally)
- **Public entry remains stable:** `src/main.js` still imports and uses `new BirdGame(...)` from `src/game.js`.
- **Debug/test contract remains stable:** Playwright tests still use:
  - `window.__birdSongDebug.*`
  - `window.advanceTime(ms)`
  - `window.render_game_to_text()`
  - `window.__birdSongReady`
- **Assets layer unchanged:** `src/gameAssets.js` stays as the asset-loading boundary.

## What changed
- Gameplay logic that used to live as large method blocks inside `src/game.js` is now in `src/gameplay/**`.
- `GameEngine` now owns the animation loop and runs systems in a defined order.

## Current safety net
- Tests: `corepack pnpm test` (Playwright) covers rings, combat, stage advance, pause, debug actions, takeoff hover, zoom, and showcase.

## Guardrails for future changes
- Keep systems “single-purpose”: one module should own one responsibility (flight vs camera vs objectives vs combat vs UI).
- Prefer pushing new logic into `src/gameplay/**` instead of adding more code back into `src/game.js`.
- If you change debug hooks, update tests in the same change (they are tightly coupled by design).

## Remaining extraction candidates (optional next steps)
- Move `updateAutopilot` into a dedicated module (`src/gameplay/flight/autopilot.js`).
- Move world-building/presentation creation (terrain, sky, nest meshes, ring mesh construction) out of `src/game.js` into `src/gameplay/presentation/**`.
- Add a small “event” layer later (optional) if systems start needing to coordinate through shared state too often.

