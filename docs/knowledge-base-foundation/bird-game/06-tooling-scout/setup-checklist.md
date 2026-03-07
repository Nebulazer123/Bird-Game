# Setup Checklist (Tooling Scout)

This is a practical checklist. Most items are optional; the goal is low-friction iteration.

## Local installs (optional but useful)
- [ ] Blender (edit/inspect GLB models; export glTF)
- [ ] Audacity (trim/normalize SFX; quick mixing)
- [ ] ffmpeg (turn screenshot sequences into short videos for side-by-side comparison)

## Accounts / paid plans
- [ ] None required for the recommended core stack.

## API keys / auth
- [ ] None required for the recommended core stack.

## Project configuration (recommended)
- [ ] Add `tweakpane` for tuning UI: `corepack pnpm add tweakpane`
- [ ] Add `howler` for audio: `corepack pnpm add howler`
- [ ] Add a debug “Input” section that displays:
  - gamepad id + mapping
  - axes values (with deadzone visualization)
  - pressed buttons
  - the final normalized `InputState` your game uses
- [ ] Add a small controller “input normalizer” layer:
  - deadzone + smoothing
  - prefer `mapping === "standard"`
  - fallback mapping (id-based) + optional simple remaps
  - persist remaps in `localStorage`
- [ ] (Optional) Add a Playwright WebKit smoke project to catch WebKit/Safari-like issues early.

## Downloads / asset collection (recommended)
- [ ] Pick 6–10 “core” SFX (free-first; track license):
  - wind loop (ambience)
  - flap
  - boost / gust dash
  - ring clear
  - damage hit
  - warning (low health / danger)
- [ ] Keep a small note of audio sources + licenses (so you don’t lose track later).

## Skip for now (intentionally)
- [ ] Full physics engine (revisit only if collision-heavy gameplay becomes central)
- [ ] Big UI framework (React/Vue) just for debug menus
- [ ] Heavy asset pipeline/optimization tooling before download size is clearly painful
- [ ] Complex visual-diff infrastructure (start with screenshots + JSON acceptance artifacts)

