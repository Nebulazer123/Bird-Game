# Featherwind Valley

A stylized third-person bird flight game built with Three.js and Vite.

## Controls

- Move the mouse to aim
- Left click to shoot
- `W` / `S`: move forward and back
- `A` / `D`: strafe left and right
- `Space`: flap upward
- `F`: gust dash
- `Esc`: pause menu
- `` ` ``: debug menu
- `1` / `2` / `3`: choose skill upgrades

## Progression

- Fly through all 12 wind gates.
- Every 4 gates grants a skill point.
- Land on the Sun Nest to finish the run.

## Scripts

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm preview`
- `corepack pnpm test`
- `corepack pnpm assets:fetch`
- `corepack pnpm artifact:graphics-showcase`

## Graphics Setup

- Run `corepack pnpm assets:fetch` to download the player bird, enemy bird, HDRI lighting, and Kenney world assets into `public/assets/`.
- Use the in-game `Debug` button, then enable `Showcase` to hold the player and enemy on screen for inspection.
- Run `corepack pnpm artifact:graphics-showcase` to save a screenshot and JSON proof in `output/`.

## Credits

- Player bird: `Parrot.glb` from the official Three.js example assets.
- Enemy bird: `Stork.glb` from the official Three.js example assets.
- World props: Kenney Nature Kit, CC0.
- Environment lighting: Poly Haven `meadow_1k.hdr`, CC0.
