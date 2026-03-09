import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

export const VALLEY_LAYOUT = {
  river: [
    { x: -180, z: -18, y: 6.4, width: 54 },
    { x: -100, z: -6, y: 6.8, width: 50 },
    { x: -10, z: 6, y: 7.1, width: 48 },
    { x: 100, z: -10, y: 7.4, width: 46 },
    { x: 200, z: 12, y: 7.8, width: 44 },
    { x: 315, z: -18, y: 8.2, width: 40 },
    { x: 430, z: 26, y: 8.6, width: 36 },
  ],
  flightLane: [
    { x: -116, z: 8, y: 28, width: 62 },
    { x: -36, z: 22, y: 34, width: 64 },
    { x: 58, z: -8, y: 48, width: 66 },
    { x: 162, z: 8, y: 64, width: 60 },
    { x: 256, z: -16, y: 82, width: 56 },
    { x: 346, z: 18, y: 102, width: 54 },
    { x: 430, z: 40, y: 118, width: 50 },
  ],
  nestPeak: {
    x: 452,
    z: 58,
    y: 124,
  },
  ridgeAnchors: [
    { x: -160, z: -118, radiusX: 100, radiusZ: 68, height: 26 },
    { x: -88, z: 122, radiusX: 126, radiusZ: 72, height: 28 },
    { x: 32, z: -108, radiusX: 130, radiusZ: 76, height: 34 },
    { x: 146, z: 126, radiusX: 142, radiusZ: 82, height: 36 },
    { x: 268, z: -114, radiusX: 138, radiusZ: 76, height: 40 },
    { x: 362, z: 132, radiusX: 128, radiusZ: 74, height: 46 },
    { x: 470, z: 86, radiusX: 98, radiusZ: 80, height: 54 },
  ],
  shelfAnchors: [
    { x: -48, z: 84, radiusX: 92, radiusZ: 34, height: 8 },
    { x: 134, z: -84, radiusX: 108, radiusZ: 42, height: 10 },
    { x: 300, z: 92, radiusX: 94, radiusZ: 38, height: 12 },
  ],
  treeGroves: [
    { x: -156, z: -128, spreadX: 56, spreadZ: 42, count: 16, family: 'pine' },
    { x: -120, z: 118, spreadX: 64, spreadZ: 40, count: 18, family: 'mixed' },
    { x: -6, z: -132, spreadX: 66, spreadZ: 44, count: 20, family: 'mixed' },
    { x: 102, z: 108, spreadX: 60, spreadZ: 42, count: 18, family: 'twisted' },
    { x: 214, z: -126, spreadX: 68, spreadZ: 48, count: 22, family: 'mixed' },
    { x: 332, z: 116, spreadX: 62, spreadZ: 40, count: 18, family: 'pine' },
    { x: 414, z: -94, spreadX: 56, spreadZ: 38, count: 12, family: 'dead' },
  ],
  rockFields: [
    { x: -134, z: -76, spreadX: 44, spreadZ: 24, count: 20, family: 'cliff' },
    { x: -32, z: 82, spreadX: 52, spreadZ: 28, count: 22, family: 'ridge' },
    { x: 124, z: -88, spreadX: 48, spreadZ: 26, count: 18, family: 'ridge' },
    { x: 286, z: 96, spreadX: 54, spreadZ: 28, count: 24, family: 'cliff' },
    { x: 422, z: 54, spreadX: 34, spreadZ: 22, count: 14, family: 'nest' },
  ],
  meadowPatches: [
    { x: -126, z: -48, spreadX: 42, spreadZ: 22, count: 24 },
    { x: -18, z: 42, spreadX: 52, spreadZ: 24, count: 26 },
    { x: 138, z: -38, spreadX: 56, spreadZ: 26, count: 28 },
    { x: 280, z: 48, spreadX: 62, spreadZ: 28, count: 28 },
    { x: 390, z: -16, spreadX: 44, spreadZ: 18, count: 16 },
  ],
  riverRocks: [
    { x: -132, z: -22, scale: 1.8 },
    { x: -62, z: -2, scale: 1.6 },
    { x: 18, z: 10, scale: 1.45 },
    { x: 92, z: -4, scale: 1.55 },
    { x: 188, z: 10, scale: 1.7 },
    { x: 280, z: -10, scale: 1.6 },
    { x: 360, z: 8, scale: 1.48 },
  ],
  supports: [
    { x: -142, z: -96, y: 56 },
    { x: 214, z: 96, y: 62 },
    { x: 448, z: 84, y: 76 },
  ],
};

function sampleTrack(points, x) {
  if (!points.length) return { x, z: 0, y: 0, width: 48 };
  if (x <= points[0].x) return { ...points[0] };
  if (x >= points[points.length - 1].x) return { ...points[points.length - 1] };

  for (let index = 0; index < points.length - 1; index += 1) {
    const left = points[index];
    const right = points[index + 1];
    if (x >= left.x && x <= right.x) {
      const t = (x - left.x) / Math.max(0.0001, right.x - left.x);
      return {
        x,
        z: lerp(left.z, right.z, t),
        y: lerp(left.y, right.y, t),
        width: lerp(left.width, right.width, t),
      };
    }
  }

  return { ...points[points.length - 1] };
}

function radialFalloff(x, z, anchor) {
  const dx = (x - anchor.x) / anchor.radiusX;
  const dz = (z - anchor.z) / anchor.radiusZ;
  return Math.max(0, 1 - dx * dx - dz * dz);
}

export function sampleRiverState(x) {
  return sampleTrack(VALLEY_LAYOUT.river, x);
}

export function sampleFlightLane(x) {
  return sampleTrack(VALLEY_LAYOUT.flightLane, x);
}

export function authoredHeightAt(x, z) {
  const river = sampleRiverState(x);
  const riverDistance = Math.abs(z - river.z);
  const bankBlend = clamp(riverDistance / Math.max(12, river.width), 0, 1);

  let height = river.y + Math.sin(x * 0.014) * 1.8 + Math.cos(z * 0.019) * 1.4;
  height -= Math.max(0, 1 - riverDistance / (river.width * 0.34)) * 2.6;
  height += Math.pow(bankBlend, 1.85) * 20;

  for (const anchor of VALLEY_LAYOUT.ridgeAnchors) {
    const bump = radialFalloff(x, z, anchor);
    if (bump > 0) height += anchor.height * bump * bump;
  }

  for (const anchor of VALLEY_LAYOUT.shelfAnchors) {
    const bump = radialFalloff(x, z, anchor);
    if (bump > 0) height += anchor.height * bump;
  }

  const outerWall = clamp((Math.abs(z - river.z) - river.width * 0.68) / 46, 0, 1);
  height += outerWall * 10;

  return height;
}

