# Bird Game - Execution Path

Date: 2026-03-07

## Now
- Treat the implemented Zen slice as the main line of development.
- Use `08-implementation/phased-implementation-plan.md` plus this synthesis package as the current source of truth for product direction.
- Keep the current architecture stable:
  - `src/game.js` as the public entry point
  - `src/gameplay/**` as the behavior layer
  - the existing debug/test contract intact
- Keep Challenge mode working, but do not let it lead roadmap decisions.

## Next

### 1. Audio polish pass
- Replace generated tones with real wind, chime, pulse, and completion sounds.
- Add a small in-repo audio source/license note.
- Keep Howler as the audio boundary.

### 2. Zen activity polish
- Turn rings into true optional music gates in Zen.
- Add at least one optional challenge route that feels clearly separate from the main mission.
- Strengthen the wind-as-instrument feeling without adding a large new system.

### 3. Readability pass
- Push the HUD closer to the UI/UX brief:
  - stronger directional danger signals
  - reduced side-panel clutter during flight
  - clearer difference between calm air and active threat
- Add more readability artifact captures for the specific moments still under-tested.

### 4. Controller polish pass
- Lock the most comfortable default mapping.
- Improve prompts and feel for controller users.
- Keep remap persistence lightweight unless a stronger accessibility need appears.

## Later
- Optional WebKit smoke coverage.
- Build-size and performance cleanup.
- More premium visual polish only after readability and feel are strong.
- Reassess whether Challenge remains a permanent secondary mode or becomes a smaller legacy branch.

## Recommended Next Build Chat Focus
If another implementation chat starts from here, the best next assignment is:

> Polish the Zen Soarer slice by upgrading audio, turning rings into optional music gates, and pushing the HUD/readability pass further without breaking the current regression suite.
