# Bird Classes + Better Valley Map + Skill Tree Restore

## Summary
- Add a player-facing bird picker with 4 birds: `Parrot` (balanced, recommended), `Hummingbird` (very agile, visually distinct), `Falcon` (fast attack runner), and `Owl` (slow but durable).
- Restore the skill tree by making `challenge` the normal startup mode. Keep `zen` available only in debug/tuning for now, since the current code hides upgrades in zen mode.
- Replace the flat-looking procedural valley with a handcrafted stylized environment built from local assets. Use [Quaternius Stylized Nature MegaKit](https://quaternius.com/packs/stylizednaturemegakit.html) as the main source because it is CC0, includes glTF, and matches the current low-poly art style. Do not use live terrain feeds like [MapTiler Terrain RGB](https://docs.maptiler.com/guides/map-tiling-hosting/data-hosting/rgb-terrain-by-maptiler/) or [Mapbox Terrain-RGB](https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-rgb-v1/) in this pass; they are better for real-world elevation maps and add account/API overhead you said you do not want.

## Key Changes
- Add a `BIRD_PROFILES` data table with: id, display name, short description, stat modifiers, tint/scale settings, and model strategy.
- Add `selectedBirdId` to game state and a start overlay with 4 selection cards plus a `Start Flight` action. The highlighted default is `Parrot`.
- Apply bird profile modifiers through the existing stat pipeline so each bird changes speed, acceleration, yaw, flap feel, health, and fire cadence without rewriting the whole game loop.
- Make the `Hummingbird` visually unique in this pass with its own lightweight mesh/model treatment and faster wing animation. The other 3 birds can reuse the current bird asset path with different scale/tint/body tuning.
- Switch normal boot flow to `challenge`, update HUD copy to challenge-first language, and keep the skill overlay, feathers, and upgrade loop visible from the first run.
- Replace the current procedural ground-only look with a handcrafted valley layout made from downloaded local environment pieces: cliff walls, tree clusters, ridge shelves, river edges, and a stronger nest peak silhouette.
- Introduce a small authored map-layout data structure for safe flight corridors and landmark anchors so ring paths, nest placement, enemy spawns, foliage placement, and any height checks stay aligned with the new terrain instead of randomly intersecting cliffs.
- Extend the asset fetch pipeline to pull the chosen Quaternius pack into local project assets and keep the current HDRI/Kenney assets as supporting dressing, not the primary map.

## Public Interfaces / Types
- New config object: `BIRD_PROFILES`.
- New state field: `selectedBirdId`.
- New map-layout config: authored valley anchors / safe corridor metadata used by course generation and terrain placement.
- Extend debug/text output to include selected bird id/name and loaded valley-map asset status so tests can verify the new flow.

## Test Plan
- Bird picker appears on startup, shows all 4 birds, and starts the run with the selected bird.
- Hummingbird selection changes rendered bird silhouette/animation and produces clearly higher agility than the balanced bird.
- Challenge mode is the default on boot, the skill UI is visible again, and earning/spending a skill point still advances the stage correctly.
- Ring, nest, zen note, and enemy spawn positions remain above terrain and outside major cliff geometry.
- New valley assets load from local files with no console/runtime errors and still pass showcase/readability checks.
- Existing movement, shooting, pause, enemy, finale, and progression Playwright scenarios continue to pass for at least one non-hummingbird bird plus hummingbird-specific selection coverage.

## Assumptions And Defaults
- Bird classes stack with the existing skill tree; skills are not bird-specific in this pass.
- `Parrot` is the balanced recommended starter, `Hummingbird` is the agile glass-cannon pick, `Falcon` is the speed/offense pick, and `Owl` is the durable/control pick.
- Zen mode is not removed, but it is no longer the default player entry path.
- The better map is a stylized handcrafted valley assembled from local downloadable assets, not a streamed real-world map service.
