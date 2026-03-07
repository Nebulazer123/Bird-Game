# Gameplay Architecture (Systems + Context)

## Decision
- **Refactor vs rebuild:** **Incremental refactor** is the right move for Bird Game.
  - The repo already had a working vertical slice plus stable Playwright tests and debug hooks.
  - A rebuild would have thrown away working feel, content, and the regression safety net.

## High-level shape
- `src/game.js` remains the **public entry point** (`export class BirdGame`) used by `src/main.js`.
- The gameplay layer is split into modules under `src/gameplay/`.
- The runtime uses a **single context object**: the `BirdGame` instance itself (it already contains scene/camera/state/entities/ui refs).

## Engine and update order
The frame loop is owned by `GameEngine`, which runs a fixed set of systems each tick:
- File: `src/gameplay/engine/gameEngine.js`
- System list: `src/gameplay/engine/systems.js`

System order (current):
1. Frame (compute `uiFrozen` + `simulationDelta`)
2. Autopilot/Input prep
3. Aim smoothing
4. Cooldowns
5. Lifecycle (death/win/flight)
6. Enemy (gated by `game.features.combatEnabled`)
7. Projectiles (gated by `game.features.combatEnabled`)
8. Course/Objectives (rings, finale, nest landing)
9. Environment
10. Camera
11. HUD
12. Debug panel

## Module boundaries (what lives where)

### Core helpers
- Constants and gameplay configuration: `src/gameplay/core/config.js`
- Math helpers: `src/gameplay/core/math.js`

### Flight feel
- Stats/tuning derived from skills + feathers: `src/gameplay/flight/stats.js`
- Input + mouse aim smoothing: `src/gameplay/flight/input.js`
- Flight integration + cooldowns + ground resolution + animation: `src/gameplay/flight/flightSystem.js`

### Camera / feel
- Third-person follow camera: `src/gameplay/camera/cameraSystem.js`

### Objective loop (rings → finale → nest landing)
- Course generation + nest placement: `src/gameplay/objectives/courseBuilder.js`
- Ring passing + ring visuals + guidance arrow + course update: `src/gameplay/objectives/ringsSystem.js`
- Finale activation + nest glow/eggs + completion rules: `src/gameplay/objectives/finaleSystem.js`

### Encounters / combat (modular)
- Enemies (spawn/update/showcase/healthbar + helpers): `src/gameplay/combat/enemySystem.js`
- Projectiles (fire/spawn/update): `src/gameplay/combat/projectileSystem.js`
- Damage/death/win/respawn: `src/gameplay/combat/damageSystem.js`

Combat can be switched off at runtime via:
- `game.features.combatEnabled` (checked in the engine systems list)

### Progression
- Skills + stage advance + skill points: `src/gameplay/progression/skills.js`

### UI sync
- HUD and overlay toggles: `src/gameplay/ui/hudSystem.js`
- DOM event bindings (mouse/keyboard/buttons): `src/gameplay/ui/bindings.js`
- Debug panel content rendering: `src/gameplay/ui/debugPanelSystem.js`

### Debug/test hooks (contract)
- Browser globals used by tests: `src/gameplay/debug/debugBridge.js`
  - `window.__birdSongDebug`
  - `window.advanceTime(ms)`
  - `window.render_game_to_text()`
  - `window.__birdSongReady`

## What stays in `src/game.js` (for now)
`src/game.js` still owns the **Three.js scene construction** and asset/presentation setup (sky, terrain, props, materials, model loading). Those are good next candidates for extraction later, but they are not required to keep gameplay maintainable.

