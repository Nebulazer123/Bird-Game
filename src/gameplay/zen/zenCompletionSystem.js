/**
 * @module zenCompletionSystem
 * Handles the final zen act: composing the valley song at the nest once all
 * nine notes are collected. Checks proximity and speed to ensure the player
 * has genuinely landed rather than just flown past.
 */
import * as THREE from 'three';

// The player must be within this radius of the nest landing point to compose.
const COMPOSE_RADIUS = 10;

/**
 * Returns true if all notes have been collected, the player hasn't composed yet,
 * and the bird is close enough to the nest landing point at low enough speed.
 */
export function canComposeAtNest(game) {
  if (game.features.mode !== 'zen') return false;
  if (game.state.zen.notesCollected < game.state.zen.notesTotal) return false;
  if (game.state.zen.composed) return false;

  const nestPoint = game.getNestLandingPoint();
  return nestPoint.distanceTo(game.bird.root.position) <= COMPOSE_RADIUS && game.bird.speed < 20;
}

/**
 * Triggers zen song composition: marks the stage complete, plays the compose
 * audio cue, and shows the finish overlay with a summary message.
 * Returns false if conditions are not met.
 */
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

/**
 * Called every frame in zen mode; attempts composition when conditions are met.
 * Exits early if paused or the skill menu is open to avoid accidental triggers.
 */
export function updateZenCompletion(game) {
  if (game.features.mode !== 'zen') return;
  if (game.state.paused || game.state.skillMenuOpen) return;
  composeZenSong(game);
}
