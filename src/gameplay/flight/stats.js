import {
  BIRD_PROFILES,
  DEATH_ANIMATION_SECONDS,
  FEATHER_SPEED_BONUS,
  FEATHER_YAW_BONUS,
  RESPAWN_SHIELD_SECONDS,
} from '../core/config.js';

export function getStats(game) {
  const skills = game.state.unlockedSkills;
  const bird = BIRD_PROFILES[game.state.selectedBirdId] ?? BIRD_PROFILES.parrot;
  const birdStats = bird.stats;
  const featherSpeed = game.state.feathers * FEATHER_SPEED_BONUS;
  const featherYaw = game.state.feathers * FEATHER_YAW_BONUS;
  const healthBoost = skills.shellGuard ? 24 : 0;
  const windPocketBonus = game.features.mode === 'zen' ? game.tuning.zen.windPocketStrength : 0;
  game.state.maxHealth = 100 + healthBoost + birdStats.healthBonus;
  if (game.state.health > game.state.maxHealth) game.state.health = game.state.maxHealth;

  return {
    cruiseSpeed: 12 + featherSpeed + (skills.tailwind ? 3.4 : 0) + windPocketBonus * 0.18 + birdStats.cruiseSpeedBonus,
    maxSpeed: 38 + featherSpeed * 1.8 + (skills.tailwind ? 7.2 : 0) + windPocketBonus * 0.35 + birdStats.maxSpeedBonus,
    reverseSpeed: 16 + (skills.skyGrip ? 1.2 : 0) + birdStats.reverseSpeedBonus,
    strafeSpeed: 16 + (skills.skyGrip ? 2.4 : 0) + birdStats.strafeSpeedBonus,
    acceleration: (3.15 + (skills.tailwind ? 0.45 : 0)) * birdStats.accelerationMultiplier,
    yawRate: (1.7 + featherYaw + (skills.skyGrip ? 0.48 : 0)) * birdStats.yawRateMultiplier,
    pitchRate: (1.2 + (skills.skyGrip ? 0.22 : 0)) * birdStats.pitchRateMultiplier,
    flapImpulse: (8.8 + (skills.tailwind ? 1.3 : 0)) * birdStats.flapImpulseMultiplier,
    flapCooldown: 0.22,
    gravity: 5.2,
    verticalDrag: 0.7,
    dashDuration: 0.9 + (skills.tailwind ? 0.12 : 0),
    dashSpeedBonus: 19 + (skills.tailwind ? 5.2 : 0) + birdStats.dashSpeedBonus,
    dashLift: 2.4 + (skills.tailwind ? 0.4 : 0),
    boostCooldown: 5.2,
    fireCooldown: (skills.rapidBeak ? 0.1 : 0.17) * birdStats.fireCooldownMultiplier,
    bulletSpeed: 88 + (skills.piercingShot ? 8 : 0) + birdStats.bulletSpeedBonus,
    bulletLifetime: 2.1,
    enemyDamage: (skills.piercingShot ? 2 : 1) + birdStats.enemyDamageBonus,
    enemyShotCooldown: 1.8,
    enemyBulletSpeed: 46,
    enemyBulletLifetime: 3.8,
    enemyBulletDamage: skills.shellGuard ? 10 : 14,
    enemySpeed: 11,
    windPulseCooldown: 3.2,
    windPulseRadius: 22,
    windPulsePush: 36,
    minClearance: 3.6 + birdStats.minClearanceBonus,
    maxClimb: 16 + (skills.tailwind ? 1.6 : 0) + birdStats.climbBonus,
    maxDrop: 22,
    respawnShieldSeconds: skills.rebirthDraft ? 2.2 : RESPAWN_SHIELD_SECONDS,
    deathAnimationSeconds: skills.rebirthDraft ? 0.24 : DEATH_ANIMATION_SECONDS,
    flapRateMultiplier: birdStats.flapRateMultiplier,
    birdId: bird.id,
    birdName: bird.name,
  };
}
