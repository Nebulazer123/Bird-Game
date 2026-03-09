/**
 * @module stats
 * Computes live bird statistics by combining base values with feather bonuses
 * and unlocked skill modifiers. Called each frame so changes take effect immediately
 * without requiring explicit invalidation. Also updates game.state.maxHealth as a
 * side-effect so the health cap is always in sync.
 */
import {
  DEATH_ANIMATION_SECONDS,
  FEATHER_SPEED_BONUS,
  FEATHER_YAW_BONUS,
  RESPAWN_SHIELD_SECONDS,
} from '../core/config.js';

/**
 * Returns a fresh stats snapshot for this frame.
 * Every numeric field is consumed by other systems (flightSystem, enemySystem, etc.)
 * so the values here are the single source of truth for tuning feel.
 */
export function getStats(game) {
  const skills = game.state.unlockedSkills;
  // Feathers passively scale speed and yaw with each ring cleared.
  const featherSpeed = game.state.feathers * FEATHER_SPEED_BONUS;
  const featherYaw = game.state.feathers * FEATHER_YAW_BONUS;
  const healthBoost = skills.shellGuard ? 24 : 0;
  // Zen mode grants a wind-pocket speed bonus from the tuning pane.
  const windPocketBonus = game.features.mode === 'zen' ? game.tuning.zen.windPocketStrength : 0;
  game.state.maxHealth = 100 + healthBoost;
  if (game.state.health > game.state.maxHealth) game.state.health = game.state.maxHealth;

  return {
    cruiseSpeed: 12 + featherSpeed + (skills.tailwind ? 3.4 : 0) + windPocketBonus * 0.18,
    maxSpeed: 38 + featherSpeed * 1.8 + (skills.tailwind ? 7.2 : 0) + windPocketBonus * 0.35,
    reverseSpeed: 16 + (skills.skyGrip ? 1.2 : 0),
    strafeSpeed: 16 + (skills.skyGrip ? 2.4 : 0),
    acceleration: 3.15 + (skills.tailwind ? 0.45 : 0),
    yawRate: 1.7 + featherYaw + (skills.skyGrip ? 0.48 : 0),
    pitchRate: 1.2 + (skills.skyGrip ? 0.22 : 0),
    flapImpulse: 8.8 + (skills.tailwind ? 1.3 : 0),
    flapCooldown: 0.22,
    gravity: 5.2,
    verticalDrag: 0.7,
    dashDuration: 0.9 + (skills.tailwind ? 0.12 : 0),
    dashSpeedBonus: 19 + (skills.tailwind ? 5.2 : 0),
    dashLift: 2.4 + (skills.tailwind ? 0.4 : 0),
    boostCooldown: 5.2,
    fireCooldown: skills.rapidBeak ? 0.1 : 0.17,
    bulletSpeed: 88 + (skills.piercingShot ? 8 : 0),
    bulletLifetime: 2.1,
    enemyDamage: skills.piercingShot ? 2 : 1,
    enemyShotCooldown: 1.8,
    enemyBulletSpeed: 46,
    enemyBulletLifetime: 3.8,
    enemyBulletDamage: skills.shellGuard ? 10 : 14,
    enemySpeed: 11,
    windPulseCooldown: 3.2,
    windPulseRadius: 22,
    windPulsePush: 36,
    minClearance: 3.6,
    maxClimb: 16 + (skills.tailwind ? 1.6 : 0),
    maxDrop: 22,
    respawnShieldSeconds: skills.rebirthDraft ? 2.2 : RESPAWN_SHIELD_SECONDS,
    deathAnimationSeconds: skills.rebirthDraft ? 0.24 : DEATH_ANIMATION_SECONDS,
  };
}
