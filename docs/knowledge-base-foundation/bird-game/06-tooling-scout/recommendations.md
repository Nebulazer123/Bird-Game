# Tooling Scout Recommendations (Bird Game)

This document is a decision-oriented shortlist of tools, libraries, workflows, and asset sources that help with:
- flight feel iteration (tuning quickly)
- camera + readability testing (repeatable capture)
- audio/feedback polish (clear signals)
- controller playtesting (Mac/Windows; PlayStation-first; Xbox supported)

## Project snapshot (tooling-relevant)
- Tech: Vite + Three.js (ES modules).
- Tests: Playwright (`@playwright/test`) with debug hooks and artifact capture scripts.
- Current input: keyboard + mouse. No controller (gamepad) layer yet.
- Current audio: none (no SFX/ambience/music system yet).
- Repo already supports: autopilot/debug actions + repeatable state inspection (`window.__birdSongDebug`, `window.render_game_to_text()`).

## Decision table (short list)

| Category | Winner | Why it wins here | Setup burden | Status |
|---|---|---:|---:|---|
| Controller playtesting (Mac/Windows) | **Web Gamepad API** + small input-normalizer layer | No dependency, works in browsers, supports both PS + Xbox | Medium (code) | **Build now** |
| Controller reliability on Windows (PlayStation) | **DS4Windows (optional)** | Free fallback if PS pads don’t expose cleanly | Low (install) | **Build now (optional)** |
| Feel/camera tuning UI | **Tweakpane** | Fast sliders/toggles without building UI from scratch | Low | **Build now** |
| Readability testing artifacts | **Keep Playwright artifact pattern** + add “readability moment” captures | You already have this pipeline; easiest to extend | Low–Medium | **Build now** |
| Safari-ish smoke checks | **Playwright WebKit project (optional)** | Catches obvious WebKit issues early | Low | **Build now (optional)** |
| Audio | **Howler.js** | Simple, stable, low-friction audio playback and mixing | Low | **Build now** |
| Free-first assets | **Kenney + Poly Haven + (careful) Quaternius/Poly Pizza** | License-friendly sources that match stylized visuals | Low | **Now** |
| Heavy asset optimization | **gltf-transform CLI (later)** | Useful once asset size is painful | Medium | **Later** |
| Premium rendering polish | **Minimal postprocessing (later)** | Good after readability is solid | Medium | **Later** |

---

## A) Controller support (Mac/Windows; PlayStation preferred; Xbox supported)

### Winner: Web Gamepad API (no external library)
**What it is:** the browser’s built-in controller API (`navigator.getGamepads()`).

**Why it fits this project**
- Low-friction: no npm dependency required.
- Works for both PlayStation and Xbox controllers in modern browsers.
- Your current input is centralized (`getInputState()`), which makes integration straightforward.

### Default mapping (chosen)
**Left stick move, right stick aim**
- Left stick: move/strafe and speed control (forward/back).
- Right stick: aim/steer (turn + pitch).
- Triggers/bumpers: flap/boost/shoot (pick the most comfortable mapping).
- Start/Options: pause.

### Implementation-facing guidance (what to build)
Build a small “input normalizer” that produces a single `InputState` each frame:
```js
// Example shape (names, not final code):
{
  moveX: -1..1,      // left stick X (strafe)
  moveY: -1..1,      // left stick Y (forward/back)
  aimX:  -1..1,      // right stick X (turn)
  aimY:  -1..1,      // right stick Y (pitch)
  flap: boolean,
  boost: boolean,
  shoot: boolean,
  pause: boolean,
  menu: boolean,
}
```

Details that matter in practice:
- **Deadzone:** ignore tiny stick movement (prevents drift). Start around `0.12` and tune.
- **Smoothing:** apply a small lerp/spring to aim so camera doesn’t jitter.
- Prefer `gamepad.mapping === "standard"` when available.
- Fallback when mapping isn’t standard:
  - use the `gamepad.id` string to select a known mapping, and/or
  - allow simple remaps for “which button does flap/boost/shoot”
- Add a **controller diagnostic** debug view:
  - detected `id` + `mapping`
  - axes values (live)
  - pressed buttons (live)
  - the final normalized `InputState`
- Persist remaps in `localStorage` so playtesters don’t reconfigure every session.

### Platform workflow guidance (how to playtest)
- **Mac:** test in **Chrome + Safari**.
  - Treat **Chrome as the baseline** while iterating. Safari support is a goal, but expect “best-effort + manual verification” until proven stable on your machine/controllers.
- **Windows:** Xbox pads should be straightforward in Edge/Chrome.
  - PlayStation pads often work; if the browser doesn’t expose the controller reliably, use DS4Windows as an optional fallback.

### Optional (Windows) reliability fallback: DS4Windows
**When to use it:** only if PlayStation controllers don’t show up cleanly in the browser.

**Why it’s acceptable:** free, common, and it can expose the pad as a standard XInput/Xbox-style device (which browsers handle well).

### Avoid (for now)
- Heavyweight input frameworks and “full rebinding UI” systems unless controller support becomes a shipping feature with accessibility requirements.

**Confidence:** medium-high (Chromium is strong; Safari requires real device testing).

---

## B) Feel/camera tuning UI

### Winner: Tweakpane
**What it is:** a small UI library that gives sliders/toggles quickly.

**Why it fits**
- Flight feel and camera behavior usually need many small numeric adjustments.
- Sliders are faster (and safer) than repeatedly editing constants by hand.
- Works well with vanilla JS + Vite.

**Setup**
- Install: `corepack pnpm add tweakpane`
- Start small: expose only the values you actually tune weekly (camera distance/lag, yaw/pitch sensitivity, deadzone, boost timing).

**Closest alternative**
- Keep expanding your existing debug panel (no new dependency). This is fine if you only need a few toggles and don’t mind more UI code.

**Confidence:** high.

---

## C) Readability testing & visual QA

### Winner: keep the existing Playwright artifact pattern and extend it
You already have repeatable:
- boot + debug hooks
- screenshot + JSON acceptance scripts

**What to add next (small, high value)**
Add 2–4 new artifact captures for “readability moments,” driven by autopilot/debug hooks:
- high-speed flight with camera turning
- approaching a ring at an angle
- enemy nearby + taking damage
- “finale / nest landing” approach

Capture:
- a screenshot (what a player sees)
- a small JSON payload (speed, camera distance, aim state, warnings)

### Optional Safari coverage aid: Playwright WebKit project (smoke test)
Purpose: catch obvious WebKit issues (layout/runtime errors) early.

Important limitations:
- Playwright WebKit is not identical to Safari.
- Controller/gamepad behavior is usually not testable through Playwright.

**Confidence:** medium (good for smoke checks, not a full Safari guarantee).

### Practical (free) tools/workflows
- Browser DevTools Performance profiler (find stutters).
- A vision simulation extension (quick “can I read this?” checks).
- Basic contrast and scale checks (HUD readability on smaller screens).

---

## D) Audio + feedback polish

### Winner: Howler.js
**What it is:** a simple browser audio library.

**Why it fits**
- Lowest friction way to add: wind ambience, flap, boost, ring-clear chime, damage hit, warning.
- Avoids writing a lot of WebAudio boilerplate.

**Setup**
- Install: `corepack pnpm add howler`
- Keep it minimal: one small audio module with named sounds + a master volume slider.

### Free-first audio sources
- Kenney audio packs (license-friendly).
- Freesound (only use sounds with licenses you’re comfortable with; keep attribution notes if required).

### Avoid (for now)
- Procedural audio stacks (Tone.js etc.) unless audio becomes a core gameplay system.

**Confidence:** high.

---

## E) Asset sources & content production (Now + Later)

### Keep using (already good)
- Kenney Nature Kit (CC0)
- Poly Haven HDRIs (CC0)
- Three.js example models (good placeholders)

### Add (free-first, stylized-friendly)
- Quaternius (check license per pack)
- Poly Pizza (check license per model)
- Sketchfab only with clear CC terms (don’t assume “free download” means “free to use”)

### Local tools (recommended)
- Blender (edit models, tweak materials, export glTF/GLB)
- Audacity (trim/normalize SFX)

### Later: asset optimization
When load times or download size becomes a problem:
- `gltf-transform` CLI to compress textures, simplify meshes, and standardize formats.

**Confidence:** medium-high (asset licensing is the main risk; track what you use).

---

## F) “Premium feel” rendering polish (Later)

### Optional winner: minimal postprocessing
Only do this after readability is strong.

Examples that often help without destroying clarity:
- subtle bloom on important highlights
- very light vignette
- controlled film grain (very low intensity)

### Avoid
- Large shader stacks early. They can hide readability problems and cost performance.

---

## Quick next actions (highest value first)
1. Add controller input normalizer + debug “Input” view (Chromium baseline, Safari best-effort).
2. Add Tweakpane for tuning camera/feel variables.
3. Add Howler with 6–10 core sounds (wind, flap, boost, ring, hit, warning).
4. Add 2–4 new Playwright artifact captures for readability moments.
5. (Optional) Add a Playwright WebKit smoke project to catch obvious WebKit issues early.

