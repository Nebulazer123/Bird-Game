/**
 * @module environmentSystem
 * Animates ambient world objects that exist independently of gameplay:
 * the water surface bob, cloud drift, and the sun shadow tracking the bird.
 */
import * as THREE from 'three';
import { seed, smoothFactor } from '../core/math.js';

const lerp = THREE.MathUtils.lerp;

/**
 * Per-frame environment update.
 * Animates water and clouds independently of gameplay state, and keeps
 * the sun light positioned relative to the bird for consistent shadow coverage.
 */
export function updateEnvironment(game, delta, elapsed) {
  // Gently bob the water surface and pulse its emissive glow for a living feel.
  if (game.waterMaterial) {
    game.waterSegments.forEach((segment, index) => {
      segment.position.y = segment.userData.baseY + Math.sin(elapsed * 0.7 + index * 0.4) * 0.18;
    });
    game.waterMaterial.emissiveIntensity = 0.14 + Math.sin(elapsed * 0.8) * 0.05;
  }

  game.clouds.forEach((cloud, index) => {
    cloud.position.x += cloud.userData.velocity * delta; // Drift eastward at each cloud's own speed.
    if (cloud.position.x > 520) {
      // Wrap cloud back to the west edge with a slightly randomised Z to prevent lanes.
      cloud.position.x = -520;
      cloud.position.z = lerp(-320, 320, seed(index * 13 + elapsed));
    }
  });

  // Keep the sun light orbiting the bird so shadows are always cast near the player.
  game.sunLight.position.copy(game.bird.root.position).add(new THREE.Vector3(-58, 92, 38));
  game.sunLight.target.position.copy(game.bird.root.position);
  game.sunLight.target.updateMatrixWorld();

  if (game.state.completed) {
    // On completion, gently guide the bird back to cruise speed for the win animation.
    game.bird.speed = lerp(game.bird.speed, 18, smoothFactor(2.5, delta));
  }
}
