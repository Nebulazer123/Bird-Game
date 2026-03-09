# Audio Source Notes

## Current Source Status (2026-03-07)

- All runtime cues are procedural WAV clips generated in `src/gameplay/audio/audioSystem.js` and played with `howler`.
- No downloaded, purchased, or bundled third-party audio assets are used in this build.
- License impact for the current cues: **none required** (self-generated DSP output only).

## Cue Inventory

| Cue | Current Implementation | Source | License |
|---|---|---|---|
| `ambience` | Layered wind noise + low drone loop | Generated in code | N/A (self-generated) |
| `flap` | Short wing whoosh with low thump | Generated in code | N/A (self-generated) |
| `boost` | Rising gust sweep with air texture | Generated in code | N/A (self-generated) |
| `warning` | Double pulse danger tone | Generated in code | N/A (self-generated) |
| `territory` | Rough territorial pressure chirp | Generated in code | N/A (self-generated) |
| `windGate` | Optional gate airflow ping | Generated in code | N/A (self-generated) |
| `compose` | Multi-note completion chime | Generated in code | N/A (self-generated) |
| `note collect` | Per-note harmonic chime map | Generated in code | N/A (self-generated) |

## Replacement Plan (Deferred)

- Replace procedural clips with curated external assets only when the final sound direction is locked.
- If/when external assets are added, this file must be expanded with:
  - asset filename/path
  - creator/source link
  - license type + attribution requirements
  - proof of permission for commercial/public use
