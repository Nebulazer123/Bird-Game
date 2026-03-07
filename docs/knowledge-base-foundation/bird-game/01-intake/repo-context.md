# Repo Context

## Files Inspected
- `README.md`
- `package.json`
- `progress.md`
- `src/main.js`
- `src/game.js`
- `src/gameAssets.js`
- `tests/game.spec.js`
- `C:\Users\Corbin\.codex\system-catalog.md`
- Copied catalog: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\system-catalog.md`

## Implications
- The repo is already beyond toy-demo stage and contains a real playable vertical slice.
- `src/main.js` provides a clear UI shell with HUD, overlays, and debug panel wiring.
- `src/gameAssets.js` is a reasonably clean reusable asset-loading layer for models and HDRI.
- `src/game.js` is the dominant gameplay file and currently contains a very large mix of flight model, combat, generation, progression, debug hooks, UI state, camera behavior, and rendering logic.
- The current loop includes rings, hunter-bird combat, feathers, skills, stage progression, finale/nest landing, pause flow, and showcase/debug behavior.
- `tests/game.spec.js` shows the project already has repeatable regression coverage for rings, combat, stage advance, pause, god mode, debug actions, spawn hover, zoom, and showcase graphics.
- The repo therefore has meaningful production value as a reference and validation base, but the gameplay structure itself is at risk of becoming harder to evolve cleanly if the current monolithic pattern continues.
- Because assets, debug hooks, and Playwright coverage already exist, the strongest planning option is not “start from zero blindly,” but rather “reuse proven assets and testing patterns while being willing to redesign the game direction and architecture aggressively.”

## Unknowns Still Remaining
- Whether the best version of the game keeps combat at all.
- Whether rings remain the right main objective or become a support mechanic inside a better loop.
- Whether the current stage/upgrades/finale stack supports the fantasy or dilutes it.
- Whether the strongest product direction is a more predatory action fantasy, a more atmospheric soaring fantasy, or a hybrid with clearer prioritization.
- Which existing systems are worth preserving after research, readability analysis, and architecture review.

## Catalog Copy Path
- `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\system-catalog.md`
