import * as THREE from 'three';

const COMPOSE_RADIUS = 10;

export function canComposeAtNest(game) {
  if (game.features.mode !== 'zen') return false;
  if (game.state.zen.notesCollected < game.state.zen.notesTotal) return false;
  if (game.state.zen.composed) return false;

  const nestPoint = game.getNestLandingPoint();
  return nestPoint.distanceTo(game.bird.root.position) <= COMPOSE_RADIUS && game.bird.speed < 20;
}

export function composeZenSong(game) {
  if (!canComposeAtNest(game)) return false;

  game.state.completed = true;
  game.state.zen.composed = true;
  game.state.paused = false;
  game.state.autopilot = false;
  game.state.winAnimationTimer = 1.15;
  game.ui.finishSummary.textContent = `You gathered ${game.state.zen.notesCollected} songs and composed a calm valley memory. Fly again whenever you want.`;
  game.ui.finishOverlay.classList.remove('is-hidden');
  game.ui.skillOverlay.classList.add('is-hidden');
  game.ui.pauseOverlay.classList.add('is-hidden');
  game.playAudioCue('compose');
  return true;
}

export function updateZenCompletion(game) {
  if (game.features.mode !== 'zen') return;
  if (game.state.paused || game.state.skillMenuOpen) return;
  composeZenSong(game);
}
