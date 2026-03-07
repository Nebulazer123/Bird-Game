/**
 * @module skills
 * Handles skill unlocking, stage advancement, and skill point management.
 * Skills are persistent within a run; each stage clear awards one point.
 */
import { SKILL_DATA } from '../core/config.js';

/**
 * Applies the named skill upgrade if the player has a skill point to spend and
 * hasn't already unlocked it. If there is a pending stage advance waiting on a
 * skill spend, advances to the next stage immediately after.
 */
export function applySkill(game, skill) {
  if (game.state.skillPoints <= 0 || !SKILL_DATA[skill] || game.state.unlockedSkills[skill]) {
    return;
  }

  game.state.skillPoints -= 1;
  game.state.unlockedSkills[skill] = true;
  game.toggleSkillMenu(false);
  if (game.state.pendingStageAdvance) {
    advanceStage(game);
  }
}

/**
 * Increments the stage counter and resets the stage so the next course is built.
 * Called after the player spends their post-stage skill point.
 */
export function advanceStage(game) {
  game.state.stage += 1;
  game.state.pendingStageAdvance = false;
  game.ui.finishOverlay.classList.add('is-hidden');
  game.resetStage();
}

/** Adds skill points (clamped to non-negative integers) and refreshes the HUD. */
export function giveSkillPoint(game, amount = 1) {
  game.state.skillPoints += Math.max(0, Number(amount) || 0);
  game.updateHud();
}

