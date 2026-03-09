/**
 * @module tuningPane
 * Creates a Tweakpane-based developer tuning panel mounted inside the debug sidebar.
 * Exposes live sliders for camera distance, input feel, zen wind-pocket strength,
 * and master audio volume. Changes take effect immediately without restarting.
 */
import { Pane } from 'tweakpane';

/**
 * Builds and returns the Tweakpane instance, or null if the mount element is absent.
 * Folders are kept collapsed by default to minimise visual noise.
 */
export function createTuningPane(game) {
  if (!game.ui.tuningMount) return null;

  const pane = new Pane({
    title: 'Flight Tuning',
    container: game.ui.tuningMount,
    expanded: false,
  });

  // Mode binding calls setMode() so the full reset pipeline runs on change.
  const modeFolder = pane.addFolder({ title: 'Slice' });
  modeFolder.addBinding(game.features, 'mode', {
    label: 'Mode',
    options: {
      Zen: 'zen',
      Challenge: 'challenge',
    },
  }).on('change', (event) => {
    game.setMode(event.value);
  });
  modeFolder.addBinding(game.features, 'combatEnabled', {
    label: 'Combat',
  });

  const cameraFolder = pane.addFolder({ title: 'Camera' });
  cameraFolder.addBinding(game.tuning.camera, 'distanceBase', { min: 9, max: 20, step: 0.1 });
  cameraFolder.addBinding(game.tuning.camera, 'distanceSpeedScale', { min: 0.02, max: 0.16, step: 0.005 });
  cameraFolder.addBinding(game.tuning.camera, 'followLag', { min: 2, max: 8, step: 0.1 });
  cameraFolder.addBinding(game.tuning.camera, 'fovBoost', { min: 0, max: 14, step: 0.5 });

  const inputFolder = pane.addFolder({ title: 'Input' });
  inputFolder.addBinding(game.tuning.input, 'deadzone', { min: 0.05, max: 0.3, step: 0.01 });
  inputFolder.addBinding(game.tuning.input, 'aimSmoothing', { min: 4, max: 18, step: 0.5 });
  inputFolder.addBinding(game.tuning.zen, 'windPocketStrength', { min: 0, max: 10, step: 0.25 });

  const audioFolder = pane.addFolder({ title: 'Audio' });
  audioFolder.addBinding(game.tuning.audio, 'masterVolume', { min: 0, max: 1, step: 0.01 })
    .on('change', () => game.syncAudioTuning());

  return pane;
}
