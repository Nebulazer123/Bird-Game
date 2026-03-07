# System Catalog for Project Intake Orchestrator

**Purpose:** This file is the orchestrator's lookup table for what skills, MCPs, tools, and asset sources are available. The orchestrator should read this file before choosing what to launch.

**Recommended location:**
`docs/knowledge-base-foundation/system-catalog.md`

---

## Already Installed Skills

### Role: Research
**Skill name:** `research-kb`
- Best at: deep product idea research, competitor scans, audience language, design pattern research, tech option research, risk/opportunity mapping, evidence pack generation.
- Use when: a project needs broad foundational research before architecture or execution.
- Notes: this is already personalized and should usually be the first specialist launched for new ideas.

### Role: Web game build + test loop
**Skill name:** `develop-web-game`
- Best at: building a web game and pairing it with a Playwright testing loop.
- Use when: the project is explicitly a browser game or game-like interactive.
- Notes: this can overlap with architecture, UI, and testing for game projects.

### Role: GitHub CI debugging
**Skill name:** `gh-fix-ci`
- Best at: debugging failing GitHub Actions or CI.
- Use when: the workflow problem is CI-specific.

### Role: Deployment - Netlify
**Skill name:** `netlify-deploy`
- Best at: deploying websites to Netlify.
- Use when: the final target is Netlify.

### Role: PDF work
**Skill name:** `pdf`
- Best at: creating, editing, reviewing, organizing, and converting PDFs.
- Use when: a project needs PDF generation, editing, or analysis.

### Role: Persistent browser QA
**Skill name:** `playwright-interactive`
- Best at: persistent browser QA in Electron.
- Use when: you need an interactive browser session rather than one-shot CLI automation.
- Pros: good for iterative UI inspection.
- Cons: less clean for scripted repeatable runs than CLI-based Playwright.

### Role: Screenshot capture
**Skill name:** `screenshot`
- Best at: capturing screenshots.
- Use when: the workflow needs visual snapshots for analysis or comparison.

### Role: Video generation
**Skill name:** `sora`
- Best at: generating and managing Sora videos.
- Use when: a project needs promo video, concept video, or motion content.

### Role: Spreadsheet work
**Skill name:** `spreadsheet`
- Best at: creating, editing, and analyzing spreadsheets.
- Use when: structured tabular planning or exports matter.

### Role: Git finalize + PR
**Skill name:** `yeet`
- Best at: stage, commit, and open PR.
- Use when: changes are done and need to be wrapped up.

### Role: DOCX work
**Skill name:** `doc`
- Best at: editing and reviewing docx files.
- Use when: formal document output is needed.

### Role: Image generation/editing
**Skill name:** `imagegen`
- Best at: generating and editing images with OpenAI.
- Use when: a project needs visual assets, concept art, hero art, or mock visuals.

### Role: Official OpenAI reference
**Skill name:** `openai-docs`
- Best at: referencing official OpenAI docs, including ChatGPT and GPT-5.4-related material.
- Use when: the project depends on OpenAI platform behavior, SDKs, apps, or model-specific guidance.

### Role: Terminal browser automation
**Skill name:** `playwright`
- Best at: automating real browsers from the terminal.
- Use when: scripted browser flows, repeatable checks, or automation are needed.
- Pros: cleaner for repeatable flows.
- Cons: less interactive than `playwright-interactive`.

### Role: Create skills
**Skill name:** `skill-creator`
- Best at: creating new Codex-compatible skills.
- Use when: a needed role has no strong public fit or needs personalization.

### Role: Slide deck work
**Skill name:** `slides`
- Best at: creating and editing PPTX slide decks.
- Use when: the project needs presentations or deck exports.

### Role: Speech generation
**Skill name:** `speech`
- Best at: generating narrated audio from text.
- Use when: a project needs spoken demos, narration, or audio outputs.

### Role: Deployment - Vercel
**Skill name:** `vercel-deploy`
- Best at: deploying applications and websites to Vercel.
- Use when: Vercel is the chosen deploy target.

### Role: ChatGPT apps build
**Skill name:** `chatgpt-apps`
- Best at: building ChatGPT apps, classifying app architecture, reading current OpenAI Apps SDK docs, and producing a working repo shape.
- Use when: the project is specifically a ChatGPT app or connector-style app.

### Role: Linear workflow
**Planned skill name:** `linear`
- Status: not installed (not created yet).
- Best at: structured workflow for issues, projects, and team work in Linear.
- Use when: the project needs Linear integration.
- Notes: probably irrelevant for most solo hobby builds.

### Role: Audio transcription
**Skill name:** `transcribe`
- Best at: transcribing audio using OpenAI, with optional speaker diarization.
- Use when: audio notes, interviews, or voice capture need transcription.

### Role: Deployment - Render
**Planned skill name:** `render-deploy`
- Status: not installed (not created yet).
- Best at: deploying applications to Render via Blueprints or MCP.
- Use when: Render is the chosen deploy target.

### Role: GitHub PR comments
**Skill name:** `gh-address-comments`
- Best at: finding open PR reviews for the current branch and addressing comments with gh CLI.
- Use when: post-review cleanup is needed.



### Role: Requirements clarifier
**Skill name:** `ask-questions-if-underspecified`
- Best at: clarifying underdefined requirements before implementation.
- Use when: the project idea is vague, overloaded, or missing decision points.
- Why install: this is the cleanest off-the-shelf fit for a requirements clarifier.

### Role: Architecture planner
**Skill name:** `architecture-planner`
- Best at: planning project structure, boundaries, module layout, and maintainability.
- Use when: the build needs a real architecture decision instead of improvised folder chaos.
- Why install: this fills one of the main gaps not covered by `research-kb`.

### Role: Database and data model
**Skill name:** `database-design`
- Best at: schema design, migrations, indexing, SQL/NoSQL patterns.
- Use when: a project has persistence, structured data, accounts, tracking, or analytics.
- Why install: this is the strongest clear-fit public option found.

### Role: UI implementation
**Skill name:** `frontend-design`
- Best at: polished web UI, landing pages, dashboards, components, and styled frontend output.
- Use when: the project needs good-looking production-grade frontend work.
- Pros: strong for web UI output.
- Cons: not the same thing as a design strategy skill.

### Role: UI/UX direction and design intelligence
**Skill name:** `ui-ux-pro-max`
- Best at: UI/UX design direction, visual decision support, patterns, palettes, typography, UX strategy, and helping choose what “good” looks like.
- Use when: the project needs design guidance and UI/UX strategy (not just UI code output).
- Pros: better for taste/direction than raw component generators.
- Cons: overlaps with `frontend-design`; not a substitute for implementation.

### Role: Implementation planner
**Skill name:** `implementation-planner`
- Best at: turning a chosen plan into phased implementation steps.
- Use when: research and architecture are done and the build needs execution sequencing.

### Role: Synthesis analyst
**Skill name:** `synthesis-analyst`
- Status: installed (custom skill present).
- Best at: reading the full shared project knowledge base, resolving conflicts between specialist outputs, choosing the strongest direction, and writing final planning artifacts into `09-synthesis`.
- Use when: earlier specialist work already exists and the project needs a final recommended direction strong enough for later build chats to follow.
- Notes: reads the global system catalog first, treats the shared planning folder as the main project truth, and updates `09-synthesis` plus `index.md` when useful.

### Role: Optional document coauthoring
**Planned skill name:** `doc-coauthoring`
- Status: not installed (not created yet).
- Best at: co-authoring specs, proposals, and structured docs.
- Use when: the project needs higher-quality formal planning docs.
- Notes: optional, because your orchestrator and synthesis flow may already cover much of this.


### Role: Project intake orchestrator
**Skill name:** `project-intake-orchestrator`
- Status: installed (custom skill present).
- Why: no public skill cleanly covers deep intake, repo scan, skill selection, prompt generation, and shared-folder orchestration the way you want.

### Role: Tooling and third-party scout
**Skill name:** `tooling-and-third-party-scout`
- Status: installed (custom skill present).
- Best at: selecting best-fit MCPs, tools, libraries, component systems, asset sources, docs sources, and implementation accelerators before build work starts.
- Use when: a project needs concrete guidance on what to install, configure, download, sign up for, defer, or ignore.
- Notes: reads the global system catalog and shared project folder first, then writes practical recommendations into `06-tooling-scout`.

### Role: UI/UX direction
**Planned skill name:** `ui-ux-direction`
- Status: not installed (not created yet).
- Closest public fit: `ui-ux-pro-max`
- Recommendation: start with `ui-ux-pro-max`; only build a custom `ui-ux-direction` skill if you feel the public one is too generic.

---

## MCPs and External Tools

### Role: Official OpenAI docs and platform truth
**Tool name:** `OpenAI Docs MCP`
- Best at: official docs lookup for OpenAI, Codex, models, apps, SDKs.
- Use when: the project depends on OpenAI platform behavior or current docs.
- Access: official OpenAI docs/MCP flow.
- Setup note: may require adding MCP config in Codex.

### Role: Version-specific framework and library docs
**Tool name:** `Context7 MCP`
- Best at: current version-specific docs for frameworks and libraries.
- Use when: choosing or implementing with libraries where stale docs would hurt.
- Pros: strong for accurate, version-aware coding context.
- Cons: requires setup; may need account/API configuration.

### Role: Component and visual UI generation
**Tool name:** `21st.dev Magic`
- Best at: modern UI component inspiration/generation and associated design assets.
- Use when: the project needs prettier, more premium-looking frontend building blocks.
- Pros: strong visual leverage.
- Cons: this is not a substitute for full project planning.

---

## Overlap Notes

### `playwright` vs `playwright-interactive`
- Use `playwright` for repeatable, scripted flows.
- Use `playwright-interactive` for persistent, exploratory UI QA.

### `frontend-design` vs `ui-ux-pro-max`
- Use `frontend-design` when the goal is actual UI output/code.
- Use `ui-ux-pro-max` when the goal is visual direction, design choices, and UI strategy.
- They work well together.

### `research-kb` vs `tooling-and-third-party-scout`
- Use `research-kb` for broad foundational project research.
- Use `tooling-and-third-party-scout` for concrete tool/library/MCP/asset selection and implementation-facing tradeoffs.

### `implementation-planner` vs `synthesis-analyst`
- Use `implementation-planner` to phase the build.
- Use `synthesis-analyst` to judge all prior outputs and produce the final recommendation and execution path.

---

## Default Preferred Workflow
1. `project-intake-orchestrator`
2. `research-kb`
3. `ask-questions-if-underspecified` when needed
4. `tooling-and-third-party-scout`
5. `ui-ux-pro-max` and/or `frontend-design` when relevant
6. `architecture-planner`
7. `database-design` when relevant
8. `implementation-planner`
9. `synthesis-analyst`
10. build/deploy/test helpers as needed
