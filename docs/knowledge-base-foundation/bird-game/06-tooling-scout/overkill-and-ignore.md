# Overkill and Ignore (for now)

This list is “things you might be tempted to add” that usually slow you down at this stage.

## Full physics engines (Cannon, Rapier, Ammo, etc.)
Why ignore now: flight + camera + readable feedback are the priority, and a physics engine adds tuning and debugging work.

Revisit if: collisions, perching, grapples, or physical combat become a major mechanic that needs stable contact resolution.

## ECS frameworks / large architecture frameworks
Why ignore now: you’re still deciding the best game loop and feel; big refactors can distract.

Revisit if: you commit to a bigger content scale (many enemy types, many interactables) and the current structure blocks you.

## Big controller/input frameworks with full rebinding UI
Why ignore now: for playtesting, Gamepad API + a small normalizer + a simple debug view is usually enough.

Revisit if: controller support becomes a shipping feature with accessibility requirements (full rebinding, multiple layouts, controller-specific prompts/icons).

## Procedural audio stacks (Tone.js, complex WebAudio graphs)
Why ignore now: you need clear SFX and ambience fast; procedural audio is a time sink.

Revisit if: audio becomes gameplay (rhythm, systemic music layers, procedural sound design).

## Heavy post-processing / shader stacks early
Why ignore now: it can hide readability problems and create performance risk.

Revisit if: HUD and world readability are already strong and you’re polishing “premium look” intentionally.

## Early asset optimization pipeline (Draco/meshopt/texture compression everywhere)
Why ignore now: optimizing too early often breaks materials or slows iteration.

Revisit if: load time / download size becomes a consistent complaint or blocks sharing builds.

