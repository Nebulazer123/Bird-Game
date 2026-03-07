# Audio Source Notes

- Current Zen slice audio is generated in code through `howler` using tiny synthesized WAV data URIs.
- This keeps the prototype self-contained while we validate timing, volume, and feedback roles.
- No third-party audio files are bundled yet, so there are no external audio licenses to track for the current build.
- Next replacement targets:
  - wind ambience loop
  - flap
  - gust burst
  - note collect chimes
  - territory warning
