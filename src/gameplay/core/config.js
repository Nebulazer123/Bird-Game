/**
 * @module config
 * Central repository of game-wide constants. Keeping magic numbers here makes
 * it easy to tune balance values and geometry without hunting through logic files.
 */
import * as THREE from 'three';

// Bird spawns near the west edge of the valley, facing roughly north-east.
export const START_POSITION = new THREE.Vector3(-116, 28, 8);
// Hard boundary that prevents the bird and projectiles from leaving the playable area.
export const WORLD_LIMIT = 520;
// Shared downward unit vector used for ground raycasts, avoids repeated allocation.
export const DOWN = new THREE.Vector3(0, -1, 0);

// Each stage adds RINGS_PER_STAGE gates on top of the base set, increasing difficulty.
export const BASE_RING_COUNT = 12;
export const RINGS_PER_STAGE = 3;
// Torus geometry dimensions for the ring gates.
export const RING_MAJOR_RADIUS = 7;
export const RING_TUBE_RADIUS = 0.85;
// The clearance radius is slightly larger than the visual ring so near-misses still count.
export const RING_CLEAR_RADIUS = RING_MAJOR_RADIUS * 1.25;

// Collision radii used in simple sphere-vs-sphere hit detection for projectiles and enemies.
export const PLAYER_BULLET_RADIUS = 1.6;
export const ENEMY_BULLET_RADIUS = 1.6;
export const ENEMY_BODY_RADIUS = 3.1;

// Converts the internal speed unit (world-units/s) to a familiar mph display value.
export const MPH_PER_SPEED = 2.60976;

// Every FEATHER_RING_STEP rings cleared awards one feather, which passively boosts stats.
export const FEATHER_RING_STEP = 4;
export const FEATHER_SPEED_BONUS = 0.45;  // Speed added per feather collected
export const FEATHER_YAW_BONUS = 0.06;    // Yaw rate added per feather collected

// Timings (seconds) for the death tumble animation, win celebration, and post-respawn invincibility.
export const DEATH_ANIMATION_SECONDS = 0.45;
export const WIN_ANIMATION_SECONDS = 1.15;
export const RESPAWN_SHIELD_SECONDS = 1.2;

/** Static metadata for every unlockable skill, keyed by skill identifier. */
export const SKILL_DATA = {
  rapidBeak: {
    label: 'Rapid Beak',
    branch: 'Offense',
    description: 'Faster beak-shot cooldown.',
  },
  piercingShot: {
    label: 'Piercing Shot',
    branch: 'Offense',
    description: 'Shots punch through and deal extra damage.',
  },
  tailwind: {
    label: 'Tailwind',
    branch: 'Flight',
    description: 'Higher cruise speed and stronger dash.',
  },
  skyGrip: {
    label: 'Sky Grip',
    branch: 'Flight',
    description: 'Sharper yaw and pitch control.',
  },
  shellGuard: {
    label: 'Shell Guard',
    branch: 'Survival',
    description: 'More health and softer incoming hits.',
  },
  rebirthDraft: {
    label: 'Rebirth Draft',
    branch: 'Survival',
    description: 'Shorter respawn recovery and spawn shielding.',
  },
};

/** Asset URL pairs (local CDN path first, remote fallback second). */
export const ASSET_URLS = {
  hdri: {
    local: '/assets/hdri/meadow_1k.hdr',
    remote: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/meadow_1k.hdr',
  },
  player: {
    local: '/assets/models/player/parrot.glb',
    remote: 'https://threejs.org/examples/models/gltf/Parrot.glb',
  },
  enemy: {
    local: '/assets/models/enemy/stork.glb',
    remote: 'https://threejs.org/examples/models/gltf/Stork.glb',
  },
  kenney: {
    trees: [
      '/assets/models/kenney/tree_pineTallA_detailed.glb',
      '/assets/models/kenney/tree_pineTallB_detailed.glb',
      '/assets/models/kenney/tree_pineRoundC.glb',
    ],
    rocks: [
      '/assets/models/kenney/rock_largeA.glb',
      '/assets/models/kenney/rock_largeC.glb',
      '/assets/models/kenney/rock_smallD.glb',
      '/assets/models/kenney/rock_tallC.glb',
    ],
    foliage: [
      '/assets/models/kenney/plant_bushDetailed.glb',
      '/assets/models/kenney/grass_large.glb',
      '/assets/models/kenney/flower_yellowB.glb',
      '/assets/models/kenney/mushroom_tanGroup.glb',
    ],
  },
};

