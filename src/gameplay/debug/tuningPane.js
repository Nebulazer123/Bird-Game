import { Pane } from 'tweakpane';

export function createTuningPane(game) {
  if (!game.ui.tuningMount) return null;

  const pane = new Pane({
    title: 'Flight Tuning',
    container: game.ui.tuningMount,
    expanded: false,
  });

  const modeFolder = pane.addFolder({ title: 'Wing Turn Sharpness' });
  modeFolder.addBinding(game.features, 'mode', {
    label: 'Game Mode',
    options: {
      Zen: 'zen',
      Challenge: 'challenge',
    },
  }).on('change', (event) => {
    game.setMode(event.value);
  });
  modeFolder.addBinding(game.features, 'combatEnabled', {
    label: 'Enemies Enabled',
  });

  const cameraFolder = pane.addFolder({ title: 'Camera' });
  cameraFolder.addBinding(game.tuning.camera, 'distanceBase', { label: 'Camera Distance', min: 9, max: 200, step: 0.1 });
  cameraFolder.addBinding(game.tuning.camera, 'distanceSpeedScale', { label: 'Speed Zoom', min: 0.02, max: 0.16, step: 0.005 });
  cameraFolder.addBinding(game.tuning.camera, 'followLag', { label: 'Camera Smoothness', min: 2, max: 8, step: 0.1 });
  cameraFolder.addBinding(game.tuning.camera, 'fovBoost', { label: 'Speed View Boost', min: 0, max: 14, step: 0.5 });

  const inputFolder = pane.addFolder({ title: 'Input' });
  inputFolder.addBinding(game.tuning.input, 'deadzone', { label: 'Stick Sensitivity Zone', min: 0.05, max: 0.3, step: 0.01 });
  inputFolder.addBinding(game.tuning.input, 'aimSmoothing', { label: 'Turn Smoothness', min: 4, max: 18, step: 0.5 });
  inputFolder.addBinding(game.tuning.zen, 'windPocketStrength', { label: 'Wind Lift Strength', min: 0, max: 10, step: 0.25 });

  const audioFolder = pane.addFolder({ title: 'Audio' });
  audioFolder.addBinding(game.tuning.audio, 'masterVolume', { label: 'Game Volume', min: 0, max: 1, step: 0.01 })
    .on('change', () => game.syncAudioTuning());

  return pane;
}
