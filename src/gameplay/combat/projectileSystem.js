/**
 * @module projectileSystem
 * Handles spawning, movement, and collision for both player and enemy projectiles.
 * Player bullets are aimed at the cursor world-ray intersection point; enemy
 * bullets target the bird's current position. Both use simple sphere vs sphere
 * collision detection each frame.
 */
import * as THREE from 'three';
import {
  ENEMY_BODY_RADIUS,
  ENEMY_BULLET_RADIUS,
  PLAYER_BULLET_RADIUS,
  WORLD_LIMIT,
} from '../core/config.js';
import { getStats } from '../flight/stats.js';

/**
 * Fires one player bullet from the bird's beak towards the cursor aim point.
 * In zen mode this is remapped to a wind pulse instead of a bullet.
 * Returns false if the fire cooldown is still active.
 */
export function firePlayerProjectile(game) {
  const stats = getStats(game);
  if (game.bird.fireCooldown > 0) return false;
  if (game.features.mode === 'zen') {
    return game.triggerWindPulse();
  }

  const muzzle = game.bird.root.localToWorld(new THREE.Vector3(0, 0.4, 3.8));
  // Project a ray from the camera through NDC cursor coords to find the aim world point.
  const ndcX = game.mouseAim.screenX * 2 - 1;
  const ndcY = -(game.mouseAim.screenY * 2 - 1);
  game.aimRaycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), game.camera);
  const cursorTarget = game.tmpVector3
    .copy(game.aimRaycaster.ray.origin)
    .addScaledVector(game.aimRaycaster.ray.direction, 400);
  const direction = cursorTarget.sub(muzzle).normalize();
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 8), game.playerProjectileMaterial);
  mesh.position.copy(muzzle);
  mesh.castShadow = false;
  game.scene.add(mesh);
  game.playerProjectiles.push({
    position: muzzle,
    velocity: direction.multiplyScalar(stats.bulletSpeed),
    mesh,
    age: 0,
    lifetime: stats.bulletLifetime,
    damage: stats.enemyDamage,
  });
  game.bird.fireCooldown = stats.fireCooldown;
  game.debugLastShotAt = performance.now();
  return true;
}

/**
 * Spawns one enemy projectile aimed at the given world-space target position.
 * No-ops in zen mode or if the enemy is dead.
 */
export function spawnEnemyProjectile(game, targetPosition, enemy) {
  if (game.features.mode === 'zen') return;
  if (!enemy || !enemy.alive) return;
  const stats = getStats(game);
  const muzzle = enemy.root.localToWorld(new THREE.Vector3(0, 0.35, 2.8));
  const direction = targetPosition.clone().sub(muzzle).normalize();
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), game.enemyProjectileMaterial);
  mesh.position.copy(muzzle);
  game.scene.add(mesh);
  game.enemyProjectiles.push({
    position: muzzle,
    velocity: direction.multiplyScalar(stats.enemyBulletSpeed),
    mesh,
    age: 0,
    lifetime: stats.enemyBulletLifetime,
    damage: stats.enemyBulletDamage,
  });
}

/**
 * Advances all active projectiles and resolves collisions.
 * Player bullets check every enemy each frame; with piercingShot they continue
 * after the first hit. Enemy bullets deal damage on reaching the bird.
 */
export function updateProjectiles(game, delta) {
  if (delta <= 0) return;

  // Rebuild the player projectiles array, dropping expired or out-of-bounds shots.
  const nextPlayer = [];
  const stats = getStats(game);
  game.playerProjectiles.forEach((shot) => {
    shot.age += delta;
    if (shot.age > shot.lifetime) {
      game.scene.remove(shot.mesh);
      return;
    }
    shot.position.addScaledVector(shot.velocity, delta);
    shot.mesh.position.copy(shot.position);
    if (Math.abs(shot.position.x) > WORLD_LIMIT || Math.abs(shot.position.z) > WORLD_LIMIT) {
      game.scene.remove(shot.mesh);
      return;
    }

    let pierced = false;
    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      const distance = shot.position.distanceTo(enemy.root.position);
      if (distance < ENEMY_BODY_RADIUS + PLAYER_BULLET_RADIUS) {
        enemy.health -= shot.damage;
        game.updateEnemyHealthBar(enemy);
        if (enemy.health <= 0) {
          enemy.alive = false;
          enemy.root.visible = false;
          enemy.healthBar.mesh.visible = false;
          enemy.respawnTimer = game.state.finaleActive ? 5.5 : 4;
          game.state.enemyKills += 1;
        }
        if (!game.state.unlockedSkills.piercingShot || shot.pierced) {
          game.scene.remove(shot.mesh);
          pierced = true;
          break;
        }
        shot.pierced = true;
      }
    }
    if (pierced) return;

    nextPlayer.push(shot);
  });
  game.playerProjectiles = nextPlayer;

  const nextEnemy = [];
  game.enemyProjectiles.forEach((shot) => {
    shot.age += delta;
    if (shot.age > shot.lifetime) {
      game.scene.remove(shot.mesh);
      return;
    }
    shot.position.addScaledVector(shot.velocity, delta);
    shot.mesh.position.copy(shot.position);
    if (Math.abs(shot.position.x) > WORLD_LIMIT || Math.abs(shot.position.z) > WORLD_LIMIT) {
      game.scene.remove(shot.mesh);
      return;
    }

    const distance = shot.position.distanceTo(game.bird.root.position);
    if (distance < ENEMY_BULLET_RADIUS + 2.4) {
      game.scene.remove(shot.mesh);
      game.state.recentHitTimer = 0.3;
      game.state.damageFlashTimer = 0.4;
      game.applyPlayerDamage(shot.damage, 'attack', shot.position);
      return;
    }

    nextEnemy.push(shot);
  });
  game.enemyProjectiles = nextEnemy;
}
