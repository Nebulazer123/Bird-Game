import * as THREE from 'three';
import {
  BASE_RING_COUNT,
  RINGS_PER_STAGE,
  START_POSITION,
} from '../core/config.js';
import { seed } from '../core/math.js';
import { VALLEY_LAYOUT, sampleFlightLane } from '../presentation/valleyLayout.js';

const lerp = THREE.MathUtils.lerp;

export function generateStageCourse(game, stage = game.state.stage) {
  const ringCount = BASE_RING_COUNT + (stage - 1) * RINGS_PER_STAGE;
  const seedBase = stage * 97.17;
  const ringPositions = [];
  let previous = START_POSITION.clone();

  for (let index = 0; index < ringCount; index += 1) {
    const progress = (index + 1) / (ringCount + 1);
    const guideX = lerp(START_POSITION.x + 36, VALLEY_LAYOUT.nestPeak.x - 38, progress);
    const lane = sampleFlightLane(guideX);
    const lateralSwing = (seed(seedBase + index * 5.7) - 0.5) * lane.width * 0.72;
    const x = guideX + (seed(seedBase + index * 3.1) - 0.5) * 18;
    const z = lane.z + lateralSwing;
    const y = Math.max(
      lane.y + progress * 16 + seed(seedBase + index * 2.4) * 14,
      game.heightAt(x, z) + 18 + progress * 10,
    );
    const point = new THREE.Vector3(x, y, z);
    if (point.distanceTo(previous) < 26) {
      point.x += 18;
      point.y += 10;
    }
    ringPositions.push(point);
    previous = point;
  }

  const lastRing = ringPositions[ringPositions.length - 1];
  const nestPosition = new THREE.Vector3(
    VALLEY_LAYOUT.nestPeak.x,
    VALLEY_LAYOUT.nestPeak.y + stage * 3,
    VALLEY_LAYOUT.nestPeak.z + (seed(seedBase + 999) - 0.5) * 12,
  );
  nestPosition.y = Math.max(nestPosition.y, game.heightAt(nestPosition.x, nestPosition.z) + 62);
  game.courseData = {
    ringPositions,
    nestPosition,
    enemySpawns: VALLEY_LAYOUT.supports.map((anchor, index) => (
      new THREE.Vector3(
        anchor.x + index * 8,
        Math.max(anchor.y + 8, game.heightAt(anchor.x, anchor.z) + 16),
        anchor.z + (index - 1) * 6,
      )
    )),
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
