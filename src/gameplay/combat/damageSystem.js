import { START_POSITION } from '../core/config.js';
import { getStats } from '../flight/stats.js';

export function applyPlayerDamage(game, amount, source = 'attack') {
  if (!Number.isFinite(amount) || amount <= 0) return;
  if (game.state.godMode || game.state.respawnShieldTimer > 0) return;
  game.state.health = Math.max(0, game.state.health - amount);
  game.state.damageFlashTimer = 0.45;
  game.state.recentHitTimer = 0.45;
  game.state.dangerWarning = source === 'ground' ? 'Ground too close' : 'Incoming threat';
  if (game.state.health <= 0) {
    triggerPlayerDeath(game, source);
  }
}

export function triggerPlayerDeath(game, source = 'ground') {
  if (game.state.deathAnimationTimer > 0 || game.state.completed) return;
  const stats = getStats(game);
  game.state.playerDeaths += 1;
  game.state.deathAnimationTimer = stats.deathAnimationSeconds;
  game.state.health = 0;
  game.bird.speed = 0;
  game.bird.verticalVelocity = source === 'ground' ? -3 : 0;
  game.playerProjectiles.forEach((shot) => game.scene.remove(shot.mesh));
  game.enemyProjectiles.forEach((shot) => game.scene.remove(shot.mesh));
  game.playerProjectiles = [];
  game.enemyProjectiles = [];
}

export function updateDeathAnimation(game, delta) {
  game.state.deathAnimationTimer = Math.max(0, game.state.deathAnimationTimer - delta);
  game.bird.root.rotation.z += delta * 7.8;
  game.bird.root.rotation.x += delta * 2.2;
  game.bird.root.position.y -= delta * 8;
  if (game.state.deathAnimationTimer <= 0) {
    respawnPlayer(game);
  }
}

export function updateWinAnimation(game, delta) {
  game.state.winAnimationTimer = Math.max(0, game.state.winAnimationTimer - delta);
  game.bird.root.position.y += Math.sin(game.clock.elapsedTime * 12) * delta * 2.4;
  game.bird.root.rotation.z = Math.sin(game.clock.elapsedTime * 8) * 0.12;
}

export function respawnPlayer(game) {
  const stats = getStats(game);
  game.state.health = game.state.maxHealth;
  game.state.deathAnimationTimer = 0;
  game.state.respawnShieldTimer = stats.respawnShieldSeconds;
  game.bird.root.position.copy(START_POSITION);
  game.bird.speed = 18;
  game.bird.heading = 0.62;
  game.bird.pitch = 0;
  game.bird.verticalVelocity = 0;
  game.bird.bank = 0;
  game.bird.fireCooldown = 0;
  game.bird.boostCooldown = 0;
  game.playerProjectiles.forEach((shot) => game.scene.remove(shot.mesh));
  game.enemyProjectiles.forEach((shot) => game.scene.remove(shot.mesh));
  game.playerProjectiles = [];
  game.enemyProjectiles = [];
  game.resetMouseAim();
}
