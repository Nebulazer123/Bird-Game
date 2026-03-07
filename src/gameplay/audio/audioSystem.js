import { Howl, Howler } from 'howler';

function buildToneDataUri(frequency = 440, durationSeconds = 0.18, volume = 0.35) {
  const sampleRate = 22050;
  const sampleCount = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const dataSize = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const envelope = Math.exp(-time * 6.8);
    const sample = Math.sin(Math.PI * 2 * frequency * time) * envelope * volume;
    view.setInt16(44 + index * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

const TONE_MAP = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392,
  A4: 440,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  C6: 1046.5,
};

function createSound(src, options = {}) {
  return new Howl({
    src: [src],
    preload: true,
    html5: false,
    ...options,
  });
}

export function createAudioSystem(game) {
  const ambienceSource = buildToneDataUri(220, 2.8, 0.12);
  const flapSource = buildToneDataUri(520, 0.09, 0.22);
  const boostSource = buildToneDataUri(340, 0.14, 0.28);
  const warningSource = buildToneDataUri(180, 0.22, 0.24);
  const territorySource = buildToneDataUri(246, 0.18, 0.25);
  const composeSource = buildToneDataUri(392, 0.55, 0.3);

  return {
    unlocked: false,
    ambienceStarted: false,
    masterVolume: game.tuning.audio.masterVolume,
    ambience: createSound(ambienceSource, { loop: true, volume: 0.12 }),
    flap: createSound(flapSource, { volume: 0.28 }),
    boost: createSound(boostSource, { volume: 0.25 }),
    warning: createSound(warningSource, { volume: 0.22 }),
    territory: createSound(territorySource, { volume: 0.26 }),
    compose: createSound(composeSource, { volume: 0.32 }),
    noteCache: new Map(),
  };
}

export function unlockAudio(game) {
  if (!game.audio) return;
  game.audio.unlocked = true;
  Howler.volume(game.tuning.audio.masterVolume);
}

export function syncAudioTuning(game) {
  if (!game.audio) return;
  game.audio.masterVolume = game.tuning.audio.masterVolume;
  Howler.volume(game.audio.masterVolume);
}

export function playAudioCue(game, key) {
  if (!game.audio?.unlocked) return;
  game.audio[key]?.play?.();
}

export function playNoteCollect(game, tone = 'C4') {
  if (!game.audio?.unlocked) return;
  const frequency = TONE_MAP[tone] ?? TONE_MAP.C4;
  if (!game.audio.noteCache.has(tone)) {
    game.audio.noteCache.set(
      tone,
      createSound(buildToneDataUri(frequency, 0.22, 0.28), { volume: 0.28 }),
    );
  }
  game.audio.noteCache.get(tone)?.play?.();
}

export function updateAudio(game) {
  if (!game.audio?.unlocked) return;

  syncAudioTuning(game);

  if (!game.audio.ambienceStarted && !game.state.paused) {
    game.audio.ambience.play();
    game.audio.ambienceStarted = true;
  }

  const ambienceVolume = game.features.mode === 'zen' ? 0.16 : 0.08;
  game.audio.ambience.volume(ambienceVolume * game.tuning.audio.masterVolume);
}
