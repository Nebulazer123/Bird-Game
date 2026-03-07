import * as THREE from 'three';
import { seed, smoothFactor } from '../core/math.js';

const lerp = THREE.MathUtils.lerp;

export function updateEnvironment(game, delta, elapsed) {
  if (game.waterMaterial) {
    game.water.position.y = 7.2 + Math.sin(elapsed * 0.7) * 0.35;
    game.waterMaterial.emissiveIntensity = 0.14 + Math.sin(elapsed * 0.8) * 0.05;
  }

  game.clouds.forEach((cloud, index) => {
    cloud.position.x += cloud.userData.velocity * delta;
    if (cloud.position.x > 520) {
      cloud.position.x = -520;
      cloud.position.z = lerp(-320, 320, seed(index * 13 + elapsed));
    }
  });

  game.sunLight.position.copy(game.bird.root.position).add(new THREE.Vector3(-58, 92, 38));
  game.sunLight.target.position.copy(game.bird.root.position);
  game.sunLight.target.updateMatrixWorld();

  if (game.state.completed) {
    game.bird.speed = lerp(game.bird.speed, 18, smoothFactor(2.5, delta));
  }
}

