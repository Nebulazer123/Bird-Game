# Bird Game — Readability & Feel Direction (UI/UX)

This document defines **how the screen should communicate flight feel** (momentum, pursuit, danger, boost, aim, and control confidence). It is not a “make the HUD prettier” brief.

It is written to be **decision-complete** so later implementation work can follow it without guessing.

---

## Locked Direction Decisions

- **HUD density:** Minimal during normal flight. Tutorials appear briefly, then fade out.
- **Speed communication:** “Feel-first” (camera + motion + audio + VFX). A small meter is allowed, but **a big speed number is not the main cue**.
- **Combat role:** **Secondary threat.** Combat UI becomes “loud” only when hunters engage or shots are incoming.

---

## Readability Hierarchy (Priority Order)

When the screen gets busy, the UI must preserve this priority stack:

- **P0 — Don’t crash / don’t die**
  - Ground proximity danger
  - Incoming fire danger (directional)
  - Low HP danger
- **P1 — Stay in control**
  - Clear steer intent (where am I aiming / turning)
  - Boost state (ready / active / cooling)
  - Fire state (ready / cooling)
  - Immediate feedback that inputs are “taking”
- **P2 — Stay on objective**
  - Next gate direction + gate progress
- **P3 — Meta (only when safe/paused)**
  - Feathers, skill points, debug controls, long-form text

Rule: **P0 must win screen space** over everything. If P0 is active, P2/P3 should fade down.

---

## Screen Language (“Grammar”)

Use consistent “visual verbs” so the player understands states without reading paragraphs:

- **Momentum =** camera + wind cues (not text)
  - Camera pulls back slightly at high speed; subtle FOV increase; optional wind streaks.
- **Pursuit =** pressure indicator (direction + intensity)
  - A directional cue that grows more urgent as threat rises.
- **Threat =** incoming-fire warning (directional + urgent)
  - Direction wedge at screen edge + quick pulse timing (fast = urgent).
- **Boost =** single glanceable state (ready / active / cooling)
  - Communicated around the reticle as a ring (center-weighted).
- **Aim =** reticle behavior + hit confirmation (no “Aim: centered” text)
  - Reticle changes shape/brightness; hit confirms are brief and readable.
- **Control confidence =** immediate micro-feedback for each input
  - Acknowledge steer, brake, flap, dash with small, fast signals (not big panels).

Rule: The player should be able to answer these questions with **one glance**:
1) “Am I safe right now?” (P0)
2) “Can I boost / can I shoot?” (P1)
3) “Where is the next gate?” (P2)

---

## Current HUD (Observed) → Desired HUD (Direction)

Today, the flight HUD is **panel-heavy**:
- Top title + subtitle block (large, always on)
- Left “Controls” card (always on)
- Right cards for Speed + Status with **large numbers and multiple text lines**
- Text like “Aim drifting…” and “Hunter HP …” is always present

Direction: replace this with **center-weighted cues + contextual danger**:
- Center tells you **control + abilities**
- Edges tell you **threat direction**
- Top-center tells you **objective**
- Everything else is temporary or suppressed during danger

---

## HUD Layout Spec (Zones + Elements + Behaviors)

### 1) Center (Always): Reticle

**Purpose:** communicate aim intent + confirm actions without text.

Reticle states:
- **Neutral:** thin, calm reticle; no pulsing.
- **Firing:** brief “snap” (brightness + slight scale up/down).
- **Hit confirm:** 120–180ms flash (different accent color) + tiny ring burst.
- **Boost active:** reticle becomes brighter and slightly “stretched” to imply speed.

Hard rules:
- Reticle is never blocked by a panel.
- Reticle changes are **fast** (100–200ms), not floaty.

### 2) Near-center (Always): Ability Rings (Boost + Fire)

**Purpose:** communicate readiness at a glance.

- **Boost ring (primary):**
  - **Ready:** full ring, steady glow.
  - **Active:** ring becomes brighter + slightly thicker; optional trailing wedge shows drain.
  - **Cooling:** ring is partially filled and refills; muted color.
- **Fire ring (secondary, thinner):**
  - Quick “cooldown sweep” to show when the next shot is ready.

Hard rule: these rings replace “meters + text labels” during flight.

### 3) Top-center (Always): Objective Chip

**Purpose:** communicate objective without paragraphs.

Format:
- `Gate X / Y` (or `Nest` when gates are complete)
- A small direction cue that aligns with the existing guidance arrow concept:
  - If target is on-screen: a small “tick” cue is enough.
  - If off-screen: show a subtle arrow/wedge direction.

Hard rules:
- No subtitles or lore text during active flight.
- The chip must not be wider than the center safe zone (avoid blocking sky/terrain).

### 4) Lower-left (Contextual): Survival Widget

**Purpose:** P0 cues without noise.

Contents:
- Minimal HP bar (no “100/100” unless paused/debug).
- On hit: damage direction indicator (one of:
  - a ring segment around reticle, or
  - a short-lived arrow/wedge pointing toward the source).
- Ground proximity warning:
  - Appears only when altitude is low.
  - Uses a simple icon + pulse (do not show a paragraph).

Behavior:
- Quiet by default (low opacity).
- Becomes loud only when danger rises (hit, low HP, low altitude).

### 5) Screen edge (Contextual): Threat / Pursuit Indicator

**Purpose:** directional pressure and urgency.

When hunters are present and relevant:
- Show an off-screen direction wedge at the nearest screen edge.
- Intensity is driven by threat:
  - nearby hunter
  - incoming shots (highest urgency)
  - being chased (medium urgency)

Behavior:
- If no threat, indicator is off.
- If threat is high, indicator wins over P2/P3 (objective/meta fades down).

### 6) Tutorials (Temporary): 1-line Prompts

**Purpose:** teach controls without permanent clutter.

Replace the always-on “Controls” panel with:
- Short prompts like: “Press **F** to gust dash (when ready).”
- Each prompt self-dismisses after the player uses that input **2–3 times**.
- Prompts do not appear during high danger (P0), only when safe.

---

## Reduce / Remove / Reframe / Add (Explicit Decisions)

### Remove from flight HUD
- Large title + subtitle block (keep for menu/intro only)
- Always-on controls card
- Always-on multi-line status text (“Aim drifting…”, “Hunter HP …” as sentences)
- Big numeric speed as the primary cue

### Reframe
- “Mission” text → **Objective chip** (“Gate X / Y”)
- Speed number → **feel cues** + small readiness rings/meter near reticle
- Hunter info → **direction + urgency** (edge wedge), not a text paragraph

### Add (critical)
- Damage direction indicator (brief, directional, unmistakable)
- Incoming-shot warning (higher urgency than generic pursuit)
- Threat/off-screen hunter direction (edge wedge)
- Boost state around reticle (ready/active/cooling)
- Short-lived tutorial prompts that self-dismiss

---

## Camera + Motion Readability Guidance (Non-code, Concrete)

Camera is part of the UI. It must support horizon/terrain reading and speed feel.

Rules:
- Maintain a stable “look-ahead” framing; avoid big UI surfaces in the center third.
- At higher speed:
  - **Slight pullback** (more forward visibility)
  - **Subtle FOV increase** (sell momentum)
- Avoid “UI vs world” competition:
  - Do not place large glass cards near the horizon line.
  - Keep critical UI in the center safe zone and edges, not across the middle.

Motion clarity rules:
- Prefer transform/opacity animation (fast, clean) over large sliding panels.
- Provide a reduced-motion mode later if needed, but default should prioritize clarity:
  - quick micro-feedback (100–200ms)
  - limited persistent pulsing (only when danger is present)

---

## Optional References (Why These Patterns Work)

These are not “style references”; they’re **readability references**:

- **Warframe (Archwing):** center-weighted ability cues; speed feel via camera/VFX instead of text.
- **Ace Combat:** strong directional missile/threat warnings at screen edges.
- **Apex Legends:** excellent damage direction readability (quick, unmistakable direction + urgency).
- **Titanfall 2:** minimal HUD that emphasizes motion and control confidence.
- **Wipeout / F-Zero:** communicates speed primarily through motion language, not numbers.

Use these as pattern proof, not as a visual copy target.

---

## Validation Checklist (How to Judge If This Works)

Use existing screenshots in `output/` and new captures later to confirm:

- **No paragraph reading required** during flight.
- In a busy scene, the player can identify in ~1 glance:
  - next gate direction / progress
  - boost ready vs cooling vs active
  - incoming threat direction (and urgency)
- Danger stacking stays readable:
  - low HP + low altitude + incoming shots still communicates P0 clearly

Scenario sanity checks:
- High speed + turning (motion clarity)
- Hunter engaged + incoming shots (threat clarity)
- Low HP + near ground (danger stacking)
- Boost loop (ready → active → cooldown is obvious)

---

## Next Step (Implementation Hand-off Notes)

This brief implies a future HUD refactor:
- Replace persistent DOM cards with a small set of always-on center elements (reticle + rings + objective chip).
- Move “controls learning” to temporary prompts.
- Make threat/damage indicators contextual and directional.

No code changes are required to accept this direction, but future UI tasks should treat this file as the source of truth.

