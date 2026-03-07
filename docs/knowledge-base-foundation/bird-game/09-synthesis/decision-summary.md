# Bird Game - Decision Summary

Date: 2026-03-07

| Area | Chosen Option | Rejected or Deferred Alternatives | Why the Chosen Option Wins | Revisit Trigger |
|---|---|---|---|---|
| Product direction | Zen Soarer is the default slice | Reopening action-first identity as the main direction | This is both the research winner and the implemented result in `08-implementation/phased-implementation-plan.md` | Revisit only if Zen playtests show weak retention even after polish |
| Core loop | Collect notes, compose at nest, keep rings optional in Zen | Rings as the main mission spine in all modes | Zen now has a clearer purpose without forcing a checklist loop; Challenge preserves the old route for mastery | Revisit if Zen note collection feels too thin after music-gate work |
| Challenge structure | Keep Challenge as a secondary preserved mode | Delete the old loop entirely or make it primary again | It protects previous work, tests, and mastery play without defining the default product | Revisit if maintaining two modes starts slowing all core work |
| Combat role | Zen uses Wind Pulse plus optional territory pressure; projectile combat stays in Challenge | Shooter combat as a cross-mode identity | This keeps tension without letting Zen become a browser shooter | Revisit only if Zen lacks enough interaction even after territory and gate polish |
| Architecture | Continue incremental refactor on the current modular repo | Full restart from scratch | `src/gameplay/**` already absorbed the new slice successfully while preserving debug hooks and assets | Revisit only if new work starts collapsing back into unmaintainable monolith patterns |
| UI direction | Keep pushing toward center-weighted readability with contextual danger | Return to panel-heavy HUD or treat UI as cosmetic only | The updated HUD already moved in this direction and the earlier UI brief still applies cleanly | Revisit after a dedicated readability pass and more artifact captures |
| Tooling | Keep Howler, Tweakpane, Gamepad API normalizer, and Playwright artifact workflow | New heavy frameworks or paid tooling | These were recommended earlier and are now actually installed or wired into the repo | Revisit if a clear missing capability appears during polish |
| Testing | Treat Playwright mode-aware coverage plus readability artifact capture as the regression baseline | Manual-only checking | This gives fast protection for both Zen and Challenge behavior | Revisit if controller coverage or Safari/WebKit issues become important |
| Audio | Keep current generated tones as temporary proof, then replace with real assets | Staying on placeholder tones indefinitely | The scaffold works, but final feel needs real audio content | Revisit when the audio asset pass begins |
| Controller support | Keep the current controller-ready foundation and polish it next | Shipping keyboard/mouse only by default forever | The code already supports gamepad normalization and debug diagnostics | Revisit if user testing shows controller demand is low |

## Bottom Line
- **Zen is the product.**
- **Challenge is a preserved side mode, not the main direction.**
- **The repo should now focus on polishing the shipped Zen slice, not debating its existence.**
