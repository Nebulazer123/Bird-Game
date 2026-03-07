# Launch Prompts

Project folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game`

## Ordered Skill Launch List

1. `research-kb`
2. `ui-ux-pro-max`
3. `architecture-planner`
4. `tooling-and-third-party-scout`
5. `implementation-planner`
6. `synthesis-analyst`

## Prompt Blocks

## 1. Product and Fantasy Research

- Skill: `research-kb`
- Output folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\02-research\`
- Read first:
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\index.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\00-master-brief\project-overview.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\00-master-brief\assumptions-and-constraints.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\01-intake\repo-context.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\01-intake\intake-summary.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\system-catalog.md`
- Deliverables:
  - A research brief on the strongest possible bird-game fantasy and positioning for this project.
  - A direct judgment on whether combat strengthens or weakens the best version of the game.
  - A comparison of alternative loop directions, including whether rings should remain central.
  - A concise recommendation for what could make this game feel genuinely special instead of merely functional.
- Stop when:
  - The research folder contains a decision-oriented output strong enough to guide later design and architecture work.

Prompt:

You are the product/fantasy research specialist for Bird Game. This is an existing Three.js + Vite browser game repo with a playable vertical slice, but the team does not want to preserve the current implementation by default. Read the planning folder first, especially the intake summary and repo context. Your job is to evaluate what bird fantasy this game should actually serve, what loop best supports that fantasy, and whether combat belongs in the strongest version of the game or currently dilutes the flight fantasy. Compare promising directions, reference relevant inspirations and patterns, and produce decision-oriented research written into the `02-research` folder. Focus especially on broad action-player appeal, polished vertical-slice scope, and the goal of making the game feel special through moment-to-moment feel rather than feature accumulation. Stop once the research outputs clearly recommend a direction and frame the key product tradeoffs.

## 2. Readability and Feel Direction

- Skill: `ui-ux-pro-max`
- Output folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\07-ui-ux\`
- Read first:
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\index.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\00-master-brief\success-criteria.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\01-intake\intake-summary.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\src\main.js`
  - `C:\Users\Corbin\Documents\test-codex\bird game\src\style.css`
- Deliverables:
  - A UI/UX direction brief centered on camera readability, speed readability, motion clarity, feedback clarity, danger readability, and control communication.
  - Recommendations for how the screen should communicate momentum, pursuit, threat, boost state, aim state, and control confidence.
  - A judgment on what interface elements should be reduced, removed, reframed, or added to support a premium-feeling action game.
  - Optional visual/reference guidance if it directly supports readability and feel.
- Stop when:
  - The UI/UX folder contains a direction document that helps the team judge feel and readability, not just visual polish.

Prompt:

You are the UI/UX direction specialist for Bird Game. Do not treat this as a “make the HUD prettier” task. Read the planning folder first, then inspect the current UI shell and styles. Your job is to define how the game should communicate flight feel, speed, danger, motion, and control on screen for broad action players. Focus on camera readability, speed readability, motion clarity, feedback readability, threat signaling, and whether the screen makes the player feel in control of a powerful bird. Decorative menu polish is secondary. Write your outputs into `07-ui-ux` and make them decision-oriented so architecture and implementation planning can use them later. Stop when the UI/UX direction clearly explains how readability should support the chosen bird fantasy.

## 3. Gameplay Structure and Architecture

- Skill: `architecture-planner`
- Output folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\04-architecture\`
- Read first:
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\index.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\01-intake\repo-context.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\01-intake\intake-summary.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\src\game.js`
  - Any completed `02-research` and `07-ui-ux` outputs
- Deliverables:
  - A recommended architecture direction for the gameplay layer.
  - A clear judgment on whether the current structure should be incrementally refactored or largely rebuilt.
  - A proposed module boundary plan separating flight model, camera/feel systems, objective loop, encounters/combat if retained, progression, debug tools, and presentation/UI sync.
  - A migration approach that preserves useful assets/tests where practical.
- Stop when:
  - The architecture folder contains a decision-complete structural recommendation grounded in the chosen fantasy and loop direction.

Prompt:

You are the architecture specialist for Bird Game. This repo already has a playable vertical slice, but most gameplay logic lives in a large `src/game.js` file. Read the intake docs first, then the current gameplay code, then any completed research and UI/UX direction outputs. Your job is not to protect the current structure. Your job is to decide whether the gameplay layer should be substantially reorganized or effectively restarted, and to propose the cleanest maintainable architecture for the next phase. Separate core flight feel systems from loop logic, encounters, progression, presentation, and debug/test hooks. Preserve only what is genuinely valuable. Write your outputs into `04-architecture`. Stop once another implementation-focused chat could use your architecture documents without needing to make major structure decisions.

## 4. Tooling, References, and Accelerators

- Skill: `tooling-and-third-party-scout`
- Output folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\06-tooling-scout\`
- Read first:
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\index.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\system-catalog.md`
  - `C:\\Users\\Corbin\\Documents\\test-codex\\bird game\\docs\\knowledge-base-foundation\\bird-game\\01-intake\\repo-context.md`
  - Any completed `02-research`, `04-architecture`, and `07-ui-ux` outputs
- Deliverables:
  - Recommended tools, libraries, references, asset sources, and iteration helpers for improving game feel and readability.
  - Guidance on what to install, what to avoid, and what existing setup is already enough.
  - Suggestions for anything that would accelerate camera/feel iteration, visual readability testing, audio/feedback polish, or content production without forcing expensive new subscriptions.
- Stop when:
  - The tooling folder contains practical shortlist recommendations that later build chats can act on directly.

Prompt:

You are the tooling and third-party scout for Bird Game. Read the catalog and planning folder first. Your job is to recommend the best practical tools, libraries, helper workflows, asset sources, and references for the next stage of this project. Prioritize things that help with flight feel iteration, camera readability testing, feedback clarity, and premium-feeling presentation. Prefer local-first or low-friction options and avoid recommending paid complexity unless the benefit is strong. Write decision-oriented recommendations into `06-tooling-scout` and stop when the team has a clear shortlist of what to use, ignore, or defer.Also evaluate the best low-friction browser game controller support path for Mac/Windows playtesting, with preference for PlayStation controllers but support for common Bluetooth Xbox Controller gamepads if necessary. Recommend what should be built now, later, or avoided.

## 5. Phased Build Planning

- Skill: `implementation-planner`
- Output folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\08-implementation\`
- Read first:
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\index.md`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\00-master-brief\success-criteria.md`
  - Completed `02-research`, `04-architecture`, `06-tooling-scout`, and `07-ui-ux` outputs
- Deliverables:
  - A phased implementation plan for the chosen direction.
  - Clear sequencing for prototype validation, structural changes, feel work, readability work, and regression protection.
  - Guidance on what to build first in the next execution phase and what to delay.
- Stop when:
  - The implementation folder contains a phased plan that another build chat can execute without major planning gaps.

Prompt:

You are the implementation planning specialist for Bird Game. Read the project brief and all completed specialist outputs first. Your job is to convert the chosen direction into a concrete phased implementation plan for a polished vertical slice. Sequence the work so the team validates the highest-risk product questions early, especially flying feel, screen readability, and the role of combat. Respect the repo’s useful existing assets and Playwright coverage, but do not let the current structure dictate the plan. Write your outputs into `08-implementation` and stop when the next execution-focused chat would know exactly what to build first, second, and later.Include controller support as a tracked future implementation item, and decide whether it belongs in the first playable polish pass or a later phase.

## 6. Final Synthesis and Recommendation

- Skill: `synthesis-analyst`
- Output folder: `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\09-synthesis\`
- Read first:
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\index.md`
  - All prior outputs in `02-research`, `04-architecture`, `06-tooling-scout`, `07-ui-ux`, and `08-implementation`
  - `C:\Users\Corbin\Documents\test-codex\bird game\docs\knowledge-base-foundation\bird-game\system-catalog.md`
- Deliverables:
  - A final recommended direction for what Bird Game should become next.
  - Resolved judgments on the core fantasy, loop, role of combat, structure strategy, and execution path.
  - A concise decision package that can anchor later build chats.
- Stop when:
  - The synthesis folder contains a final recommendation strong enough to guide implementation without reopening the core product questions.

Prompt:

You are the synthesis specialist for Bird Game. Read the full shared planning folder and the copied system catalog first. Your job is to resolve conflicts across the specialist outputs and produce one clear recommended direction for what this game should become next. Judge the strength of the proposed fantasy, whether combat belongs, whether the loop should be simplified or restructured, whether the codebase should be built on or substantially replaced, and how the next execution phase should proceed. Write the final synthesis into `09-synthesis` and update `index.md` if helpful. Stop once the project has a single, strong, build-ready recommendation.
