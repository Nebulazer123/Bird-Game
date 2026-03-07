import * as THREE from 'three';
import {
  BASE_RING_COUNT,
  RINGS_PER_STAGE,
  START_POSITION,
  WORLD_LIMIT,
} from '../core/config.js';
import { seed } from '../core/math.js';

const lerp = THREE.MathUtils.lerp;

export function generateStageCourse(game, stage = game.state.stage) {
  const ringCount = BASE_RING_COUNT + (stage - 1) * RINGS_PER_STAGE;
  const seedBase = stage * 97.17;
  const ringPositions = [];
  let previous = START_POSITION.clone();

  for (let index = 0; index < ringCount; index += 1) {
    const progress = (index + 1) / (ringCount + 1);
    const x = lerp(-70, 410, progress) + (seed(seedBase + index * 3.1) - 0.5) * 34;
    const z = Math.sin(progress * Math.PI * (2.2 + seed(seedBase + index * 5.7))) * 44
      + Math.cos(progress * Math.PI * 3.6) * 18
      + (seed(seedBase + index * 8.4) - 0.5) * 22;
    const y = 34 + progress * 78 + seed(seedBase + index * 2.4) * 18;
    const point = new THREE.Vector3(x, y, z);
    if (point.distanceTo(previous) < 26) {
      point.x += 18;
      point.y += 10;
    }
    ringPositions.push(point);
    previous = point;
  }

  const lastRing = ringPositions[ringPositions.length - 1];
  const nestPosition = lastRing.clone().add(new THREE.Vector3(54, 12, 30 + (seed(seedBase + 999) - 0.5) * 28));
  nestPosition.y = Math.max(nestPosition.y, game.heightAt(nestPosition.x, nestPosition.z) + 88);
  const cornerHeight = 74 + stage * 2;
  game.courseData = {
    ringPositions,
    nestPosition,
    enemySpawns: [
      new THREE.Vector3(-WORLD_LIMIT + 82, cornerHeight, -WORLD_LIMIT + 88),
      new THREE.Vector3(WORLD_LIMIT - 92, cornerHeight + 8, -WORLD_LIMIT + 76),
      new THREE.Vector3(WORLD_LIMIT - 96, cornerHeight + 5, WORLD_LIMIT - 84),
    ],
  };
  game.state.totalRings = ringCount;
}

export function buildStageCourse(game) {
  game.clearCourseMeshes();
  generateStageCourse(game, game.state.stage);
  game.createCourse();
  positionNest(game);
  if (game.features.mode === 'challenge' && game.features.combatEnabled) {
    game.spawnEnemyWave('patrol');
  } else {
    game.clearEnemies();
    game.state.enemyWave = 'calm';
  }
}

export function positionNest(game) {
  const { nestPosition } = game.courseData;
  const baseY = game.heightAt(nestPosition.x, nestPosition.z);
  game.perch.position.set(nestPosition.x, baseY, nestPosition.z);
  game.perchPlatform.position.y = nestPosition.y - baseY;
  game.nestLip.position.y = game.perchPlatform.position.y + 0.9;
  game.perchGlow.position.y = game.perchPlatform.position.y + 1.15;
  game.nestEggs.forEach((egg, index) => {
    egg.position.set((index - 1) * 2.2, game.perchPlatform.position.y + 1.2, index === 1 ? 1.1 : -0.3);
  });
  if (!game.groundColliders.includes(game.perchPlatform)) {
    game.groundColliders.push(game.perchPlatform);
  }
}
