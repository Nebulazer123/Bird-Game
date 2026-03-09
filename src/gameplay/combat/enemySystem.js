/**
 * @module enemySystem
 * Manages the enemy bird lifecycle: creation, wave spawning, orbit AI,
 * wing animation, health bars, wind-pulse repulsion, and respawning.
 * Each enemy orbits a central point (ring, nest, or player) and fires
 * at the player when within attack range.
 */
import * as THREE from 'three';
import { forwardFromAngles, smoothFactor, wrapAngle } from '../core/math.js';
import { getStats } from '../flight/stats.js';
import { spawnEnemyProjectile } from './projectileSystem.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

/** Removes all active enemies from the scene and empties the enemies array. */
export function clearEnemies(game) {
  game.enemies.forEach((enemy) => {
    game.scene.remove(enemy.root);
  });
  game.enemies = [];
}

/**
 * Constructs a procedural enemy bird mesh, attaches a canvas health bar, and
 * returns a fully-initialised enemy entity object. The `behavior` parameter
 * controls orbit style: 'patrol' follows rings, 'territory' tracks the player,
 * 'corner' holds a fixed finale position.
 */
export function createEnemyEntity(game, position, behavior = 'patrol') {
  // Corner enemies (finale wave) use a slightly different tint to signal danger.
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: behavior === 'corner' ? 0xc86468 : 0xd86d58,
    roughness: 0.52,
    metalness: 0.03,
  });
  const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2c57f,
    roughness: 0.58,
    metalness: 0.02,
  });
  const beakMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1a15, roughness: 0.6 });
  const root = new THREE.Group();
  root.rotation.order = 'YXZ';
  const visual = new THREE.Group();
  root.add(visual);

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 20), bodyMaterial);
  body.scale.set(1.35, 0.92, 1.9);
  body.castShadow = true;
  visual.add(body);

  const leftWing = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 14), wingMaterial);
  leftWing.position.set(-1.22, 0.12, 0.1);
  leftWing.scale.set(1.95, 0.15, 1);
  leftWing.castShadow = true;
  visual.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x *= -1;
  visual.add(rightWing);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.56, 10), beakMaterial);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.16, 1.98);
  beak.castShadow = true;
  visual.add(beak);

  root.scale.setScalar(1.7);
  root.position.copy(position);

  // The health bar is a canvas texture rendered on a billboard plane above the enemy.
  const barCanvas = document.createElement('canvas');
  barCanvas.width = 128;
  barCanvas.height = 16;
  const barCtx = barCanvas.getContext('2d');
  const barTexture = new THREE.CanvasTexture(barCanvas);
  barTexture.minFilter = THREE.LinearFilter;
  barTexture.magFilter = THREE.LinearFilter;

  const barMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 0.75),
    new THREE.MeshBasicMaterial({ map: barTexture, transparent: true, depthWrite: false }),
  );
  barMesh.position.set(0, 3.4, 0);
  root.add(barMesh);
  game.scene.add(root);

  return {
    id: `enemy-${game.enemyIdCounter += 1}`,
    root,
    visual,
    leftWing,
    rightWing,
    beak,
    model: null,
    mixer: null,
    behavior,
    heading: -0.84,
    pitch: 0.04,
    health: 3,
    maxHealth: 3,
    attackCooldown: 0.65,
    alive: true,
    orbitPhase: Math.random() * Math.PI * 2,
    wingCycle: 0,
    respawnTimer: 0,
    respawnPosition: position.clone(),
    healthBar: {
      canvas: barCanvas,
      ctx: barCtx,
      texture: barTexture,
      mesh: barMesh,
      lastHealth: -1,
    },
  };
}

/**
 * Clears existing enemies and spawns a new wave based on mode.
 * 'patrol' – one enemy orbiting the middle ring.
 * 'territory' – one enemy that tracks the player (zen mode event).
 * 'finale' – three corner-positioned enemies after all rings are cleared.
 */
export function spawnEnemyWave(game, mode = 'patrol') {
  clearEnemies(game);
  game.state.enemyWave = mode;
  const positions = mode === 'finale'
    ? game.courseData.enemySpawns
    : mode === 'territory'
      ? [game.bird.root.position.clone().add(new THREE.Vector3(18, 6, -14))]
      : [game.courseData.ringPositions[Math.max(0, Math.floor(game.courseData.ringPositions.length / 2))].clone().add(new THREE.Vector3(28, 10, 18))];
  positions.forEach((position) => {
    const enemy = createEnemyEntity(game, position, mode === 'finale' ? 'corner' : mode === 'territory' ? 'territory' : 'patrol');
    game.enemies.push(enemy);
    game.applyEnemyModel(enemy);
  });
  game.enemies.forEach((enemy) => updateEnemyHealthBar(game, enemy));
}

/** Returns the first living enemy, or the first enemy regardless of alive state, or null. */
export function getPrimaryEnemy(game) {
  return game.enemies.find((enemy) => enemy.alive) ?? game.enemies[0] ?? null;
}

/** Directly sets the primary enemy health (used by debug tools). */
export function setPrimaryEnemyHealth(game, value) {
  const enemy = getPrimaryEnemy(game);
  if (!enemy) return;
  enemy.health = clamp(Number(value) || 0, 0, enemy.maxHealth);
  enemy.alive = enemy.health > 0;
  enemy.root.visible = enemy.alive;
  updateEnemyHealthBar(game, enemy);
}

/**
 * Applies damage to the primary enemy, updating the health bar and marking it
 * as dead when health reaches zero. Dead enemies respawn after a delay.
 * Returns true if a hit landed, false if no target existed.
 */
export function hitPrimaryEnemy(game, amount = 1) {
  const enemy = getPrimaryEnemy(game);
  if (!enemy || !enemy.alive) return false;
  enemy.health -= Math.max(0, Number(amount) || 0);
  updateEnemyHealthBar(game, enemy);
  if (enemy.health <= 0) {
    enemy.alive = false;
    enemy.root.visible = false;
    enemy.healthBar.mesh.visible = false;
    enemy.respawnTimer = game.state.finaleActive ? 5.5 : 4;
    game.state.enemyKills += 1;
  }
  return true;
}

/** Teleports the primary enemy to a position just ahead of the player – used by debug tools. */
export function forceEnemyNearPlayer(game) {
  const enemy = getPrimaryEnemy(game);
  if (!enemy) return;
  const forward = forwardFromAngles(game.bird.heading, 0, new THREE.Vector3());
  enemy.root.position.copy(game.bird.root.position).addScaledVector(forward, 22).add(new THREE.Vector3(0, 5, 0));
  enemy.respawnPosition.copy(enemy.root.position);
  enemy.root.visible = true;
  enemy.alive = true;
  enemy.health = enemy.maxHealth;
  enemy.attackCooldown = 0.25;
  updateEnemyHealthBar(game, enemy);
}

/** Teleports the enemy directly in front of the bird's current aim direction. */
export function forceEnemyInFront(game) {
  const enemy = getPrimaryEnemy(game);
  if (!enemy) return;
  const forward = forwardFromAngles(game.bird.heading, game.bird.pitch, new THREE.Vector3()).normalize();
  enemy.root.position
    .copy(game.bird.root.position)
    .addScaledVector(forward, 18)
    .add(new THREE.Vector3(0, 0.8, 0));
  enemy.respawnPosition.copy(enemy.root.position);
  enemy.root.visible = true;
  enemy.alive = true;
  enemy.health = enemy.maxHealth;
  enemy.attackCooldown = 1.8;
  updateEnemyHealthBar(game, enemy);
}

/**
 * Per-frame enemy AI: handles respawn countdown, orbit movement, heading/pitch
 * smoothing, animation, wind-pulse repulsion, and firing at the player.
 */
export function updateEnemy(game, delta, elapsed) {
  if (delta <= 0) return;
  if (game.state.showcaseMode) {
    updateEnemyShowcase(game, delta, elapsed);
    return;
  }
  const stats = getStats(game);
  const center = game.courseRings[game.state.activeRingIndex]?.group.position ?? game.courseData.nestPosition;
  game.enemies.forEach((enemy, index) => {
    if (!enemy.alive) {
      if (enemy.respawnTimer <= 0) {
        enemy.alive = true;
        enemy.health = enemy.maxHealth;
        enemy.root.position.copy(enemy.respawnPosition);
        enemy.root.visible = true;
        enemy.attackCooldown = 1.2;
      } else {
        return;
      }
    }

    enemy.orbitPhase += delta * (enemy.behavior === 'corner' ? 0.1 : enemy.behavior === 'territory' ? 0.26 : 0.18);
    const targetCenter = enemy.behavior === 'corner'
      ? enemy.respawnPosition
      : enemy.behavior === 'territory'
        ? game.bird.root.position
      : center;
    // Orbit radius varies per behavior: corner enemies stay tight, territory follows player, patrol sweeps rings.
    const orbitRadius = enemy.behavior === 'corner' ? 16 + index * 3 : enemy.behavior === 'territory' ? 14 : 26 + Math.sin(enemy.orbitPhase * 1.6) * 8;
    const orbitHeight = targetCenter.y + (enemy.behavior === 'territory' ? 4 : 7) + Math.sin(elapsed * 0.6 + index) * 3;
    const orbitPoint = new THREE.Vector3(
      targetCenter.x + Math.cos(enemy.orbitPhase + index) * orbitRadius,
      orbitHeight,
      targetCenter.z + Math.sin(enemy.orbitPhase + index) * orbitRadius,
    );

    const toOrbit = orbitPoint.sub(enemy.root.position);
    const distance = toOrbit.length();
    if (distance > 0.001) {
      enemy.root.position.addScaledVector(toOrbit.normalize(), Math.min(distance, stats.enemySpeed * delta));
    }

    const toBird = game.bird.root.position.clone().sub(enemy.root.position);
    const desiredHeading = Math.atan2(toBird.x, toBird.z);
    const desiredPitch = clamp(Math.atan2(toBird.y, Math.max(1, game.tmpVector2.set(toBird.x, 0, toBird.z).length())), -0.42, 0.35);
    enemy.heading = wrapAngle(lerp(enemy.heading, desiredHeading, smoothFactor(2.8, delta)));
    enemy.pitch = lerp(enemy.pitch, desiredPitch, smoothFactor(2.4, delta));
    enemy.root.rotation.set(-enemy.pitch, enemy.heading, Math.sin(elapsed * 2.1 + index) * 0.15);
    enemy.healthBar.mesh.lookAt(game.camera.position);

    if (enemy.mixer) {
      enemy.mixer.update(delta * 1.05);
    }

    if (enemy.leftWing && enemy.rightWing) {
      enemy.wingCycle += delta * 6;
      const flap = Math.sin(enemy.wingCycle) * 0.82;
      enemy.leftWing.rotation.z = -0.28 + flap;
      enemy.rightWing.rotation.z = 0.28 - flap;
    }

    // Wind pulse pushes enemies away; if a territory enemy is nearly out of range, expire the event early.
    if (game.state.windPulseTimer > 0 && toBird.length() < stats.windPulseRadius) {
      enemy.root.position.addScaledVector(enemy.root.position.clone().sub(game.bird.root.position).normalize(), stats.windPulsePush * delta);
      enemy.attackCooldown = Math.max(enemy.attackCooldown, 1.4);
      if (enemy.behavior === 'territory' && toBird.length() > stats.windPulseRadius * 0.9) {
        game.state.territoryTimer = Math.min(game.state.territoryTimer, 1.2);
      }
    }

    if (
      enemy.behavior !== 'territory'
      && enemy.attackCooldown <= 0
      && toBird.length() < 78
      && !game.state.completed
      && !game.state.skillMenuOpen
    ) {
      spawnEnemyProjectile(game, game.bird.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), enemy);
      enemy.attackCooldown = stats.enemyShotCooldown + index * 0.1;
    }
    updateEnemyHealthBar(game, enemy);
  });
}

/**
 * Special enemy update for showcase mode: enemies orbit the bird in a fixed ring
 * formation rather than executing combat AI.
 */
export function updateEnemyShowcase(game, delta, elapsed) {
  const birdPos = game.bird.root.position;
  const radius = 18;
  const baseHeight = 4.5;

  game.enemies.forEach((enemy, index) => {
    if (!enemy) return;
    if (!enemy.alive) {
      enemy.alive = true;
      enemy.health = enemy.maxHealth;
    }
    enemy.root.visible = true;

    const angle = elapsed * 0.35 + index * (Math.PI * 2 / Math.max(1, game.enemies.length));
    enemy.root.position.set(
      birdPos.x + Math.cos(angle) * radius,
      birdPos.y + baseHeight + Math.sin(angle * 2) * 0.75,
      birdPos.z + Math.sin(angle) * radius,
    );

    const toBird = birdPos.clone().sub(enemy.root.position);
    const desiredHeading = Math.atan2(toBird.x, toBird.z);
    const desiredPitch = clamp(Math.atan2(toBird.y, Math.max(1, game.tmpVector2.set(toBird.x, 0, toBird.z).length())), -0.42, 0.35);
    enemy.heading = wrapAngle(lerp(enemy.heading, desiredHeading, smoothFactor(3.2, delta)));
    enemy.pitch = lerp(enemy.pitch, desiredPitch, smoothFactor(3.0, delta));
    enemy.root.rotation.set(-enemy.pitch, enemy.heading, Math.sin(elapsed * 1.2 + index) * 0.12);
    enemy.healthBar.mesh.lookAt(game.camera.position);

    if (enemy.mixer) {
      enemy.mixer.update(delta * 1.05);
    } else if (enemy.leftWing && enemy.rightWing) {
      enemy.wingCycle += delta * 6;
      const flap = Math.sin(enemy.wingCycle) * 0.82;
      enemy.leftWing.rotation.z = -0.28 + flap;
      enemy.rightWing.rotation.z = 0.28 - flap;
    }

    updateEnemyHealthBar(game, enemy);
  });
}

/**
 * Redraws the health bar canvas texture for the given enemy.
 * The bar colour transitions green → yellow → red as health drops.
 * Early-outs if health hasn't changed to avoid unnecessary GPU uploads.
 */
export function updateEnemyHealthBar(game, enemy) {
  if (!enemy || !enemy.healthBar) return;
  if (!enemy.alive) {
    enemy.healthBar.mesh.visible = false;
    return;
  }
  enemy.healthBar.mesh.visible = true;
  if (enemy.healthBar.lastHealth === enemy.health) return;

  const { ctx, canvas, texture } = enemy.healthBar;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(10, 14, 20, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  const percent = clamp(enemy.health / enemy.maxHealth, 0, 1);
  ctx.fillStyle = percent > 0.5 ? '#7ef0a3' : percent > 0.25 ? '#ffd46a' : '#ff7a6b';
  ctx.fillRect(3, 3, (canvas.width - 6) * percent, canvas.height - 6);
  texture.needsUpdate = true;
  enemy.healthBar.lastHealth = enemy.health;
}
