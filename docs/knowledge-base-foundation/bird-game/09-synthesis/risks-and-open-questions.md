# Bird Game - Risks and Open Questions

Date: 2026-03-07

## Active Risks

### 1. Dual-mode drift
- Risk: Zen and Challenge may start competing for attention, which could blur the product again.
- Why it matters: the project only recently escaped that ambiguity.
- What reduces the risk: treat Zen as the roadmap default and use Challenge mainly for preserved mastery play and regression safety.

### 2. Zen side activities are not fully rich yet
- Risk: Zen currently proves the loop, but optional content is still lighter than the long-term vision.
- Why it matters: the mode could feel complete enough to test, but still not yet special enough to last.
- What reduces the risk: implement optional music gates, a small time-trial route, and stronger wind-as-instrument feedback.

### 3. Audio is still prototype-grade
- Risk: the current generated tones validate event timing, but they do not deliver the final emotional quality.
- Why it matters: Zen depends heavily on sound, atmosphere, and feedback.
- What reduces the risk: replace synthesized cues with curated wind, chime, and completion audio; keep a simple source/license note.

### 4. Readability is improved but not finished
- Risk: the HUD and danger language moved in the right direction, but some legacy panel weight remains and directional warning clarity can go further.
- Why it matters: screen readability is one of the project's main quality bars.
- What reduces the risk: complete the next HUD pass, especially threat direction, damage direction, and reduced persistent clutter.

### 5. Controller support is foundational, not fully polished
- Risk: the project is controller-ready in code, but not yet fully playtester-ready in UX.
- Why it matters: controller comfort strongly affects a flight game.
- What reduces the risk: finalize mapping, smooth aim behavior, and add clear prompts for controller users.

### 6. Performance and browser polish remain secondary work
- Risk: the current Vite build still reports a large chunk warning, and Safari/WebKit is still best-effort.
- Why it matters: these are not blockers for direction, but they matter before wider sharing.
- What reduces the risk: a later performance pass and optional WebKit smoke coverage.

## Open Questions

### 1. How much content should Zen include before calling the slice "complete"?
- Why it matters: the current loop is real, but the project still needs to decide the minimum polish bar for a memorable first release.
- Current default: add music gates, real audio, and one stronger readability pass before declaring the slice mature.

### 2. Should Challenge stay as a permanent second mode?
- Why it matters: preserving it is useful now, but long-term upkeep could become expensive.
- Current default: keep it for now because it protects earlier work and testing, then reassess after Zen polish.

### 3. How literal should "wind-as-instrument" become?
- Why it matters: this is the clearest route to making Zen feel special rather than merely calm.
- Current default: move from note pickups alone toward note-producing wind lines or gates, but do not rebuild the whole loop around a large music system yet.

## Blockers
- No hard blocker prevents continued work.
- The main task is alignment: later chats should not treat the game as still undecided when the implementation already made a clear call.
