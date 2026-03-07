# Bird Game - Revision Notes

Date: 2026-03-07

## Elevate

### Elevate the Zen-first recommendation
- Source: `02-research/01-fantasy-positioning-brief.md`
- Reason: the implementation artifact confirms that this was not only a recommendation but the direction actually built into the repo.

### Elevate the loop comparison's "Zen primary, challenge secondary" call
- Source: `02-research/02-loop-directions-comparison.md`
- Reason: the shipped repo now follows this structure closely by making Zen default and preserving Challenge separately.

### Elevate the implementation artifact as the current project truth
- Source: `08-implementation/phased-implementation-plan.md`
- Reason: this document resolves earlier uncertainty by describing what is already in the repo and what remains deferred.

## Revise

### Revise the earlier action-leaning intake framing
- Source: `01-intake/intake-summary.md`
- Reason: the intake's "graceful sky hunter" and broad-action framing was useful for testing alternatives, but it is no longer the best description of the default shipped slice. Its strongest remaining value is as support for optional Challenge play and readability goals.

### Revise the architecture reading of the objective loop
- Source: `04-architecture/gameplay-architecture.md`
- Reason: the architecture document still describes the ring/finale loop as the obvious objective spine. The repo now supports both a Zen note-composition loop and the preserved Challenge loop, so future architecture notes should describe the mode split more directly.

### Revise the tooling checklist from "recommended next" to "partly implemented"
- Source: `06-tooling-scout/recommendations.md` and `06-tooling-scout/setup-checklist.md`
- Reason: Tweakpane, Howler, Gamepad normalization, and readability artifacts are no longer just recommendations. They now exist in the repo and should be treated as implemented foundations.

## Defer

### Defer full UI/UX completion
- Source: `07-ui-ux/readability-and-feel-direction.md`
- Reason: the repo moved toward this spec, but the full intended readability language is not finished yet. Keep the document as the target, not as a claim that all of it is already done.

### Defer music gates as a finished Zen side system
- Source: `02-research/01-fantasy-positioning-brief.md`
- Reason: the project currently uses free-floating discovery notes rather than completed music gates. The idea is still strong, but it remains future work.

## Obsolete Assumption

### The earlier "08-implementation is empty" synthesis assumption is obsolete
- Source: `08-implementation/phased-implementation-plan.md`
- Reason: the implementation folder now contains a concrete artifact, and that artifact should override any earlier pre-implementation synthesis framing.
