import { Howl, Howler } from 'howler';

function smoothstep(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / Math.max(0.0001, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hashNoise(sampleIndex, seed = 1) {
  const value = Math.sin((sampleIndex + 1) * (12.9898 + seed * 0.731)) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function waveformTriangle(phase) {
  return (2 / Math.PI) * Math.asin(Math.sin(phase));
}

function buildProceduralWavDataUri({
  durationSeconds = 0.2,
  sampleRate = 22050,
  volume = 0.35,
  renderer,
}) {
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
    const raw = renderer(time, index, durationSeconds);
    const clipped = Math.tanh(raw * 1.4) * volume;
    view.setInt16(44 + index * 2, clipped * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/wav;base64,${globalThis.btoa(binary)}`;
}

function createSound(src, options = {}) {
  return new Howl({
    src: [src],
    preload: true,
    html5: false,
    ...options,
  });
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

function createAmbienceSource() {
  return buildProceduralWavDataUri({
    durationSeconds: 4.6,
    sampleRate: 16000,
    volume: 0.45,
    renderer: (time, index, duration) => {
      const fadeIn = smoothstep(0, 0.22, time);
      const fadeOut = 1 - smoothstep(duration - 0.28, duration, time);
      const envelope = fadeIn * fadeOut;
      const windBed = (
        hashNoise(index, 1) * 0.6
        + hashNoise(Math.floor(index * 0.5), 2) * 0.3
        + hashNoise(Math.floor(index * 0.23), 5) * 0.1
      );
      const ripple = Math.sin(Math.PI * 2 * 0.22 * time) * 0.5 + 0.5;
      const drone = Math.sin(Math.PI * 2 * 74 * time) * 0.2 + Math.sin(Math.PI * 2 * 111 * time) * 0.09;
      return envelope * (windBed * (0.11 + ripple * 0.06) + drone);
    },
  });
}

function createFlapSource() {
  return buildProceduralWavDataUri({
    durationSeconds: 0.14,
    sampleRate: 22050,
    volume: 0.52,
    renderer: (time, index, duration) => {
      const punch = 1 - smoothstep(0, duration, time);
      const texture = hashNoise(index, 8) * 0.72 + hashNoise(Math.floor(index * 0.33), 9) * 0.28;
      const thump = Math.sin(Math.PI * 2 * 142 * time) * Math.exp(-time * 17);
      return (texture * 0.35 + thump * 0.65) * punch;
    },
  });
}

function createBoostSource() {
  return buildProceduralWavDataUri({
    durationSeconds: 0.22,
    sampleRate: 22050,
    volume: 0.45,
    renderer: (time, index, duration) => {
      const t = Math.min(1, time / duration);
      const freqStart = 180;
      const freqEnd = 460;
      const phase = Math.PI * 2 * (freqStart * time + ((freqEnd - freqStart) * time * time) / (2 * duration));
      const lift = Math.sin(phase) * 0.65 + waveformTriangle(phase * 1.8) * 0.25;
      const air = hashNoise(index, 12) * 0.35;
      const envelope = smoothstep(0, 0.04, time) * (1 - smoothstep(duration - 0.1, duration, time));
      return (lift + air * (0.35 + t * 0.4)) * envelope;
    },
  });
}

function createWarningSource() {
  return buildProceduralWavDataUri({
    durationSeconds: 0.36,
    sampleRate: 22050,
    volume: 0.4,
    renderer: (time, _index) => {
      const pulseA = Math.exp(-Math.pow((time - 0.08) / 0.04, 2));
      const pulseB = Math.exp(-Math.pow((time - 0.24) / 0.055, 2));
      const tone = Math.sin(Math.PI * 2 * 178 * time) * 0.7 + Math.sin(Math.PI * 2 * 92 * time) * 0.3;
      return tone * (pulseA + pulseB);
    },
  });
}

function createTerritorySource() {
  return buildProceduralWavDataUri({
    durationSeconds: 0.28,
    sampleRate: 22050,
    volume: 0.42,
    renderer: (time, index, duration) => {
      const growl = Math.sin(Math.PI * 2 * 132 * time) * 0.45 + waveformTriangle(Math.PI * 2 * 66 * time) * 0.3;
      const grit = hashNoise(index, 17) * 0.3;
      const envelope = smoothstep(0, 0.02, time) * (1 - smoothstep(duration - 0.08, duration, time));
      return (growl + grit) * envelope;
    },
  });
}

function createWindGateSource() {
  return buildProceduralWavDataUri({
    durationSeconds: 0.24,
    sampleRate: 22050,
    volume: 0.43,
    renderer: (time, index, duration) => {
      const sparkle = Math.sin(Math.PI * 2 * 660 * time) * Math.exp(-time * 12);
      const airy = hashNoise(index, 22) * 0.18;
      const low = Math.sin(Math.PI * 2 * 210 * time) * 0.22;
      const envelope = smoothstep(0, 0.02, time) * (1 - smoothstep(duration - 0.11, duration, time));
      return (sparkle + low + airy) * envelope;
    },
  });
}

function createComposeSource() {
  return buildProceduralWavDataUri({
    durationSeconds: 0.88,
    sampleRate: 22050,
    volume: 0.42,
    renderer: (time, _index, duration) => {
      const c = Math.sin(Math.PI * 2 * 523.25 * time) * Math.exp(-time * 2.2);
      const e = Math.sin(Math.PI * 2 * 659.25 * time) * Math.exp(-time * 2.35);
      const g = Math.sin(Math.PI * 2 * 783.99 * time) * Math.exp(-time * 2.5);
      const shimmer = waveformTriangle(Math.PI * 2 * 1309 * time) * Math.exp(-time * 4.8) * 0.15;
      const body = c * 0.42 + e * 0.36 + g * 0.3 + shimmer;
      const envelope = smoothstep(0, 0.03, time) * (1 - smoothstep(duration - 0.24, duration, time));
      return body * envelope;
    },
  });
}

function createNoteSource(frequency = TONE_MAP.C4) {
  return buildProceduralWavDataUri({
    durationSeconds: 0.3,
    sampleRate: 22050,
    volume: 0.4,
    renderer: (time, index, duration) => {
      const fundamental = Math.sin(Math.PI * 2 * frequency * time) * Math.exp(-time * 5.2);
      const octave = Math.sin(Math.PI * 2 * frequency * 2 * time + 0.2) * Math.exp(-time * 7.8) * 0.48;
      const fifth = Math.sin(Math.PI * 2 * frequency * 1.5 * time) * Math.exp(-time * 8.4) * 0.22;
      const ping = waveformTriangle(Math.PI * 2 * frequency * 3 * time) * Math.exp(-time * 12.5) * 0.14;
      const air = hashNoise(index, 31) * 0.08;
      const envelope = smoothstep(0, 0.015, time) * (1 - smoothstep(duration - 0.12, duration, time));
      return (fundamental + octave + fifth + ping + air) * envelope;
    },
  });
}

export function createAudioSystem(game) {
  return {
    unlocked: false,
    ambienceStarted: false,
    masterVolume: game.tuning.audio.masterVolume,
    ambience: createSound(createAmbienceSource(), { loop: true, volume: 0.13 }),
    flap: createSound(createFlapSource(), { volume: 0.26 }),
    boost: createSound(createBoostSource(), { volume: 0.24 }),
    warning: createSound(createWarningSource(), { volume: 0.21 }),
    territory: createSound(createTerritorySource(), { volume: 0.25 }),
    windGate: createSound(createWindGateSource(), { volume: 0.24 }),
    compose: createSound(createComposeSource(), { volume: 0.29 }),
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
      createSound(createNoteSource(frequency), { volume: 0.26 }),
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

  const ambienceVolume = game.features.mode === 'zen' ? 0.17 : 0.09;
  game.audio.ambience.volume(ambienceVolume * game.tuning.audio.masterVolume);
}
