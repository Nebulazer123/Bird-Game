import * as THREE from 'three';

export const START_POSITION = new THREE.Vector3(-116, 28, 8);
export const WORLD_LIMIT = 520;
export const DOWN = new THREE.Vector3(0, -1, 0);

export const BASE_RING_COUNT = 12;
export const RINGS_PER_STAGE = 3;
export const RING_MAJOR_RADIUS = 7;
export const RING_TUBE_RADIUS = 0.85;
export const RING_CLEAR_RADIUS = RING_MAJOR_RADIUS * 1.25;

export const PLAYER_BULLET_RADIUS = 1.6;
export const ENEMY_BULLET_RADIUS = 1.6;
export const ENEMY_BODY_RADIUS = 3.1;

export const MPH_PER_SPEED = 2.60976;

export const FEATHER_RING_STEP = 4;
export const FEATHER_SPEED_BONUS = 0.45;
export const FEATHER_YAW_BONUS = 0.06;

export const DEATH_ANIMATION_SECONDS = 0.45;
export const WIN_ANIMATION_SECONDS = 1.15;
export const RESPAWN_SHIELD_SECONDS = 1.2;

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

