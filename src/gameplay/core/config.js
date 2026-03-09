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

export const BIRD_PROFILES = {
  parrot: {
    id: 'parrot',
    name: 'Parrot',
    tagline: 'Balanced and easy to learn.',
    summary: 'Steady speed, steady health, and no sharp weaknesses.',
    recommended: true,
    modelStrategy: 'sharedModel',
    stats: {
      healthBonus: 0,
      cruiseSpeedBonus: 0,
      maxSpeedBonus: 0,
      reverseSpeedBonus: 0,
      strafeSpeedBonus: 0,
      accelerationMultiplier: 1,
      yawRateMultiplier: 1,
      pitchRateMultiplier: 1,
      flapImpulseMultiplier: 1,
      fireCooldownMultiplier: 1,
      dashSpeedBonus: 0,
      bulletSpeedBonus: 0,
      enemyDamageBonus: 0,
      minClearanceBonus: 0,
      climbBonus: 0,
      flapRateMultiplier: 1,
      modelTargetSize: 5.2,
      modelYOffset: -0.6,
      modelScaleMultiplier: 1,
    },
    palette: {
      plumage: '#7e98c9',
      chest: '#f5dfbd',
      beak: '#e3a751',
      eye: '#101725',
      tint: '#ffffff',
    },
    proceduralShape: {
      bodyScale: [1.65, 1.0, 2.0],
      chestScale: [1.25, 0.9, 1.15],
      chestPosition: [0, -0.16, 0.78],
      headScale: [1, 1, 1],
      headPosition: [0, 0.42, 1.92],
      beakScale: [1, 1, 1],
      beakPosition: [0, 0.26, 2.56],
      tailScale: [1.2, 1, 1.6],
      tailPosition: [0, -0.05, -2.25],
      leftWingPivot: [-1.22, 0.22, 0.38],
      wingScale: [2.4, 0.18, 1.22],
      wingPosition: [-1.62, 0, 0.18],
      visualScale: 1,
    },
  },
  hummingbird: {
    id: 'hummingbird',
    name: 'Hummingbird',
    tagline: 'Quickest turner and fastest flapper.',
    summary: 'Very agile and rapid-fire, but low health and less margin for mistakes.',
    recommended: false,
    modelStrategy: 'procedural',
    stats: {
      healthBonus: -24,
      cruiseSpeedBonus: 2.8,
      maxSpeedBonus: 3.4,
      reverseSpeedBonus: 1.6,
      strafeSpeedBonus: 4.6,
      accelerationMultiplier: 1.42,
      yawRateMultiplier: 1.55,
      pitchRateMultiplier: 1.42,
      flapImpulseMultiplier: 0.96,
      fireCooldownMultiplier: 0.68,
      dashSpeedBonus: 1.6,
      bulletSpeedBonus: 5,
      enemyDamageBonus: 0,
      minClearanceBonus: -0.35,
      climbBonus: 1.5,
      flapRateMultiplier: 1.95,
      modelTargetSize: 4.1,
      modelYOffset: -0.45,
      modelScaleMultiplier: 0.82,
    },
    palette: {
      plumage: '#39b889',
      chest: '#bff7cc',
      beak: '#2a1d18',
      eye: '#08110c',
      tint: '#75f0bf',
    },
    proceduralShape: {
      bodyScale: [1.16, 0.82, 1.42],
      chestScale: [0.98, 0.82, 0.92],
      chestPosition: [0, -0.08, 0.58],
      headScale: [0.9, 0.9, 0.98],
      headPosition: [0, 0.32, 1.56],
      beakScale: [0.6, 1.9, 0.6],
      beakPosition: [0, 0.22, 2.62],
      tailScale: [0.75, 1, 0.88],
      tailPosition: [0, -0.05, -1.74],
      leftWingPivot: [-0.88, 0.2, 0.12],
      wingScale: [2.95, 0.11, 0.88],
      wingPosition: [-1.36, 0.08, 0.12],
      visualScale: 0.92,
    },
  },
  falcon: {
    id: 'falcon',
    name: 'Falcon',
    tagline: 'Fast hunter with harder hits.',
    summary: 'Best top speed and sharper attack pressure, with lighter armor than the parrot.',
    recommended: false,
    modelStrategy: 'sharedModel',
    stats: {
      healthBonus: -8,
      cruiseSpeedBonus: 1.8,
      maxSpeedBonus: 4.2,
      reverseSpeedBonus: 0.8,
      strafeSpeedBonus: 1.2,
      accelerationMultiplier: 1.14,
      yawRateMultiplier: 1.06,
      pitchRateMultiplier: 1.02,
      flapImpulseMultiplier: 1.08,
      fireCooldownMultiplier: 0.88,
      dashSpeedBonus: 4.2,
      bulletSpeedBonus: 6,
      enemyDamageBonus: 1,
      minClearanceBonus: -0.15,
      climbBonus: 1.2,
      flapRateMultiplier: 1.18,
      modelTargetSize: 5.35,
      modelYOffset: -0.68,
      modelScaleMultiplier: 1.02,
    },
    palette: {
      plumage: '#776c56',
      chest: '#f2e1b8',
      beak: '#f0c05a',
      eye: '#110f0b',
      tint: '#d2a869',
    },
    proceduralShape: {
      bodyScale: [1.72, 0.92, 2.25],
      chestScale: [1.16, 0.82, 1.02],
      chestPosition: [0, -0.12, 0.72],
      headScale: [0.96, 0.94, 1.02],
      headPosition: [0, 0.38, 1.98],
      beakScale: [1.08, 1.2, 1.08],
      beakPosition: [0, 0.24, 2.66],
      tailScale: [1.45, 1, 1.95],
      tailPosition: [0, -0.06, -2.52],
      leftWingPivot: [-1.28, 0.18, 0.36],
      wingScale: [2.9, 0.16, 1.16],
      wingPosition: [-1.84, 0, 0.16],
      visualScale: 1.04,
    },
  },
  owl: {
    id: 'owl',
    name: 'Owl',
    tagline: 'Tough and forgiving.',
    summary: 'Highest health and control stability, but it gives up a lot of speed.',
    recommended: false,
    modelStrategy: 'sharedModel',
    stats: {
      healthBonus: 28,
      cruiseSpeedBonus: -2.1,
      maxSpeedBonus: -4.8,
      reverseSpeedBonus: -1,
      strafeSpeedBonus: -1.4,
      accelerationMultiplier: 0.86,
      yawRateMultiplier: 0.82,
      pitchRateMultiplier: 0.84,
      flapImpulseMultiplier: 1.08,
      fireCooldownMultiplier: 1.08,
      dashSpeedBonus: -2.4,
      bulletSpeedBonus: -2,
      enemyDamageBonus: 0,
      minClearanceBonus: 0.35,
      climbBonus: -0.2,
      flapRateMultiplier: 0.84,
      modelTargetSize: 5.9,
      modelYOffset: -0.5,
      modelScaleMultiplier: 1.08,
    },
    palette: {
      plumage: '#8d8b91',
      chest: '#f1ddc0',
      beak: '#d59e59',
      eye: '#13110f',
      tint: '#c9c8d0',
    },
    proceduralShape: {
      bodyScale: [1.88, 1.26, 1.92],
      chestScale: [1.32, 1.04, 1.12],
      chestPosition: [0, -0.12, 0.68],
      headScale: [1.18, 1.16, 1.1],
      headPosition: [0, 0.52, 1.82],
      beakScale: [1.08, 0.92, 1.08],
      beakPosition: [0, 0.2, 2.42],
      tailScale: [1.02, 1, 1.18],
      tailPosition: [0, -0.03, -1.98],
      leftWingPivot: [-1.08, 0.2, 0.34],
      wingScale: [2.18, 0.24, 1.42],
      wingPosition: [-1.48, 0.06, 0.16],
      visualScale: 1.05,
    },
  },
};

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
  quaternius: {
    basePath: '/assets/models/quaternius',
    trees: [
      '/assets/models/quaternius/CommonTree_1.gltf',
      '/assets/models/quaternius/CommonTree_2.gltf',
      '/assets/models/quaternius/CommonTree_4.gltf',
      '/assets/models/quaternius/Pine_1.gltf',
      '/assets/models/quaternius/Pine_3.gltf',
      '/assets/models/quaternius/TwistedTree_2.gltf',
      '/assets/models/quaternius/TwistedTree_4.gltf',
    ],
    deadTrees: [
      '/assets/models/quaternius/DeadTree_2.gltf',
      '/assets/models/quaternius/DeadTree_4.gltf',
    ],
    rocks: [
      '/assets/models/quaternius/Rock_Medium_1.gltf',
      '/assets/models/quaternius/Rock_Medium_2.gltf',
      '/assets/models/quaternius/Rock_Medium_3.gltf',
      '/assets/models/quaternius/Pebble_Round_4.gltf',
      '/assets/models/quaternius/Pebble_Square_5.gltf',
    ],
    pathRocks: [
      '/assets/models/quaternius/RockPath_Round_Wide.gltf',
      '/assets/models/quaternius/RockPath_Round_Thin.gltf',
      '/assets/models/quaternius/RockPath_Square_Wide.gltf',
      '/assets/models/quaternius/RockPath_Square_Thin.gltf',
    ],
    foliage: [
      '/assets/models/quaternius/Bush_Common.gltf',
      '/assets/models/quaternius/Bush_Common_Flowers.gltf',
      '/assets/models/quaternius/Fern_1.gltf',
      '/assets/models/quaternius/Plant_1.gltf',
      '/assets/models/quaternius/Plant_7_Big.gltf',
      '/assets/models/quaternius/Grass_Common_Tall.gltf',
      '/assets/models/quaternius/Grass_Wispy_Tall.gltf',
      '/assets/models/quaternius/Clover_1.gltf',
      '/assets/models/quaternius/Flower_3_Group.gltf',
      '/assets/models/quaternius/Flower_4_Group.gltf',
      '/assets/models/quaternius/Mushroom_Common.gltf',
    ],
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
