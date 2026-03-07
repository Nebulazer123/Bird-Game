import { SKILL_DATA } from '../core/config.js';

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

export function advanceStage(game) {
  game.state.stage += 1;
  game.state.pendingStageAdvance = false;
  game.ui.finishOverlay.classList.add('is-hidden');
  game.resetStage();
}

export function giveSkillPoint(game, amount = 1) {
  game.state.skillPoints += Math.max(0, Number(amount) || 0);
  game.updateHud();
}

