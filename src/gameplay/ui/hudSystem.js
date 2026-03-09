import * as THREE from 'three';
import { MPH_PER_SPEED } from '../core/config.js';

const clamp = THREE.MathUtils.clamp;

function getZenObjective(game) {
  if (game.state.completed && game.state.zen.composed) {
    return {
      title: 'Song composed',
      hint: 'The valley is calm again. Restart to fly another route.',
    };
  }

  if (game.state.zen.notesCollected >= game.state.zen.notesTotal) {
    return {
      title: `Notes ${game.state.zen.notesCollected} / ${game.state.zen.notesTotal}`,
      hint: 'Return to the Sun Nest and compose the valley song.',
    };
  }

  const nextNote = game.zenNotes.find((note) => !note.collected);
  return {
    title: `Notes ${game.state.zen.notesCollected} / ${game.state.zen.notesTotal}`,
    hint: nextNote ? `Drift toward ${nextNote.label}. Wind gates are optional.` : 'Follow the warm updrafts.',
  };
}

function getChallengeObjective(game) {
  const nextTarget = game.state.activeRingIndex < game.state.totalRings
    ? `Gate ${game.state.activeRingIndex + 1} / ${game.state.totalRings}`
    : 'Nest approach';

  return {
    title: nextTarget,
    hint: game.state.activeRingIndex < game.state.totalRings
      ? 'Ride the next wind gate cleanly.'
      : 'Land on the Sun Nest to finish the run.',
  };
}

function getThreatState(game) {
  const primaryEnemy = game.getPrimaryEnemy();
  if (!primaryEnemy || !primaryEnemy.alive) {
    return {
      label: game.features.mode === 'zen' ? 'Calm air' : 'Hunter reforming',
      level: 0,
      angle: 0,
    };
  }

  const toEnemy = primaryEnemy.root.position.clone().sub(game.bird.root.position);
  const angle = Math.atan2(toEnemy.x, toEnemy.z) - game.bird.heading;
  const distance = Math.max(1, toEnemy.length());
  const level = clamp(1 - distance / 80, 0.1, 1);

  return {
    label: game.state.enemyWave === 'territory'
      ? 'Territory pressure nearby'
      : game.features.mode === 'challenge'
        ? `Hunter HP ${Math.round(primaryEnemy.health)}`
        : 'Rival bird watching your line',
    level,
    angle,
  };
}


function projectToMiniMap(game, point, size = 160) {
  const normalizedX = clamp((point.x + game.worldMapRadius) / (game.worldMapRadius * 2), 0, 1);
  const normalizedZ = clamp((point.z + game.worldMapRadius) / (game.worldMapRadius * 2), 0, 1);
  return {
    x: normalizedX * size,
    y: normalizedZ * size,
  };
}

function getMapTarget(game) {
  if (game.features.mode === 'zen') {
    const nextNote = game.zenNotes.find((note) => !note.collected);
    return nextNote ? nextNote.position : game.courseData.nestPosition;
  }

  const activeRing = game.courseRings[game.state.activeRingIndex];
  return activeRing ? activeRing.position : game.courseData.nestPosition;
}

function getTutorialPrompt(game) {
  if (game.state.recentHitTimer > 0 || game.state.lastGroundDistance < 9) return '';
  if (game.state.awaitingTakeoff) return 'Press W or push the left stick forward to start gliding.';
  if (game.state.tutorialUsage.boost < 2 && game.bird.boostCooldown <= 0) return 'Press F or the right trigger for a gust burst.';
  if (game.features.mode === 'zen' && game.state.tutorialUsage.pulse < 2) return 'Click or tap the fire button to send a Wind Pulse.';
  if (game.state.tutorialUsage.flap < 2) return 'Tap Space when you need lift near the ground.';
  return '';
}

export function updateHud(game) {
  const objective = game.features.mode === 'zen' ? getZenObjective(game) : getChallengeObjective(game);
  const threat = getThreatState(game);
  const stats = game.getStats();
  const boostReady = game.bird.boostCooldown <= 0 ? 1 : 1 - game.bird.boostCooldown / stats.boostCooldown;
  const fireReady = game.features.mode === 'zen'
    ? 1 - game.state.windPulseCooldown / stats.windPulseCooldown
    : 1 - game.bird.fireCooldown / stats.fireCooldown;
  const groundWarning = game.state.lastGroundDistance < 8.5;

  game.state.threatAngle = threat.angle;
  game.state.threatLevel = threat.level;
  game.state.tutorialPrompt = getTutorialPrompt(game);
  game.state.dangerWarning = groundWarning
    ? 'Ground too close'
    : game.state.recentHitTimer > 0
      ? 'Incoming threat'
      : threat.level > 0.55
        ? threat.label
        : '';

  game.ui.modeBadge.textContent = game.features.mode === 'zen' ? 'Zen Soarer' : 'Challenge Flight';
  game.ui.mission.textContent = objective.title;
  game.ui.objectiveHint.textContent = objective.hint;
  game.ui.rings.textContent = `${game.state.ringsCleared} / ${game.state.totalRings}`;
  game.ui.noteProgress.textContent = `${game.state.zen.notesCollected} / ${game.state.zen.notesTotal}`;
  game.ui.feathers.textContent = String(game.state.feathers);
  game.ui.skills.textContent = String(game.state.skillPoints);
  game.ui.speed.textContent = `${Math.round(game.bird.speed * MPH_PER_SPEED)} mph`;
  game.ui.health.textContent = `${Math.round(game.state.health)} / ${game.state.maxHealth}`;
  game.ui.enemy.textContent = threat.label;
  game.ui.aim.textContent = game.gamepad.connected ? 'Controller aim active' : 'Mouse aim active';
  game.ui.dangerLabel.textContent = game.state.dangerWarning || 'Clear sky';
  game.ui.tutorialPrompt.textContent = game.state.tutorialPrompt || '';

  game.ui.topBar.classList.toggle('zen-mode', game.features.mode === 'zen');
  game.ui.leftPanel.classList.toggle('is-muted', game.features.mode === 'zen');
  game.ui.rightPanel.classList.toggle('is-muted', game.features.mode === 'zen');
  game.ui.objectiveChip.classList.toggle('is-threatened', Boolean(game.state.dangerWarning));
  game.ui.survivalWidget.classList.toggle('is-danger', Boolean(game.state.dangerWarning));
  game.ui.tutorialPrompt.classList.toggle('is-hidden', !game.state.tutorialPrompt);
  game.ui.noteCard.classList.toggle('is-hidden', game.features.mode !== 'zen');
  game.ui.ringCard.classList.toggle('is-hidden', game.features.mode === 'zen');
  game.ui.skillCard.classList.toggle('is-hidden', game.features.mode === 'zen');

  game.ui.boostFill.style.transform = `scaleX(${clamp(boostReady, 0, 1)})`;
  game.ui.fireFill.style.transform = `scaleX(${clamp(fireReady, 0, 1)})`;
  game.ui.boostRing.style.setProperty('--ring-fill', `${clamp(boostReady, 0, 1)}`);
  game.ui.fireRing.style.setProperty('--ring-fill', `${clamp(fireReady, 0, 1)}`);
  game.ui.reticle.classList.toggle('is-hit', game.state.recentHitTimer > 0);
  game.ui.reticle.classList.toggle('is-boosting', game.bird.dashTimer > 0);
  game.ui.reticle.classList.toggle('is-pulse', game.state.recentPulseTimer > 0);

  game.ui.threatIndicator.style.opacity = `${clamp(threat.level, 0, 1)}`;

  if (game.ui.mapPlayer && game.ui.mapTarget && game.ui.mapNest) {
    const mapSize = game.ui.miniMap?.clientWidth || 160;
    const playerPos = projectToMiniMap(game, game.bird.root.position, mapSize);
    const targetPos = projectToMiniMap(game, getMapTarget(game), mapSize);
    const nestPos = projectToMiniMap(game, game.courseData.nestPosition, mapSize);

    game.ui.mapPlayer.style.left = `${playerPos.x}px`;
    game.ui.mapPlayer.style.top = `${playerPos.y}px`;
    game.ui.mapTarget.style.left = `${targetPos.x}px`;
    game.ui.mapTarget.style.top = `${targetPos.y}px`;
    game.ui.mapNest.style.left = `${nestPos.x}px`;
    game.ui.mapNest.style.top = `${nestPos.y}px`;

    const heading = game.bird.heading + Math.PI;
    game.ui.mapPlayer.style.transform = `translate(-50%, -50%) rotate(${heading}rad)`;
  }
  game.ui.threatIndicator.style.transform = `translateX(-50%) rotate(${threat.angle}rad) scale(${0.8 + threat.level * 0.35})`;
  game.ui.threatIndicator.classList.toggle('is-hidden', threat.level <= 0.08);
  game.ui.groundWarning.classList.toggle('is-hidden', !groundWarning);
  game.ui.groundWarning.textContent = groundWarning ? `Low clearance: ${Math.max(0, game.state.lastGroundDistance).toFixed(1)}m` : '';

  game.ui.skillCopy.textContent = game.features.mode === 'zen'
    ? 'Zen mode does not use upgrade picks. Compose songs and fly freely.'
    : game.state.skillPoints > 0
      ? `Pick one upgrade. ${game.state.pendingStageAdvance ? 'The next route opens after you spend this point.' : 'Press Tab to close.'}`
      : 'No Skill Points yet. Finish gates and bring the eggs home to earn one.';
  game.ui.openSkillsButton.textContent = game.features.mode === 'zen' ? 'Fly Again' : 'Pick Upgrade';

  game.ui.skillButtons.forEach((button) => {
    const skill = button.dataset.skill;
    const unlocked = game.state.unlockedSkills[skill];
    const disabled = unlocked || game.state.skillPoints <= 0 || game.features.mode === 'zen';
    button.classList.toggle('is-unlocked', unlocked);
    button.classList.toggle('is-disabled', disabled);
    button.disabled = disabled;
  });
}

export function toggleSkillMenu(game, forceValue) {
  if (game.features.mode === 'zen') {
    game.state.skillMenuOpen = false;
    game.ui.skillOverlay.classList.add('is-hidden');
    return;
  }

  const wantsOpen = typeof forceValue === 'boolean' ? forceValue : !game.state.skillMenuOpen;
  game.state.skillMenuOpen = wantsOpen;
  if (wantsOpen) {
    game.ui.finishOverlay.classList.add('is-hidden');
  }
  game.ui.skillOverlay.classList.toggle('is-hidden', !wantsOpen);
  if (wantsOpen) game.keys.clear();
}

export function togglePause(game, forceValue) {
  if (game.state.completed) return;
  const nextValue = typeof forceValue === 'boolean' ? forceValue : !game.state.paused;
  game.state.paused = nextValue;
  game.ui.pauseOverlay.classList.toggle('is-hidden', !nextValue);
  game.keys.clear();
}

export function toggleDebugPanel(game, forceValue) {
  const nextValue = typeof forceValue === 'boolean' ? forceValue : !game.state.debugOpen;
  game.state.debugOpen = nextValue;
  game.ui.debugPanel.classList.toggle('is-hidden', !nextValue);
}

export function toggleGodMode(game, forceValue) {
  game.state.godMode = typeof forceValue === 'boolean' ? forceValue : !game.state.godMode;
  game.updateHud();
}
