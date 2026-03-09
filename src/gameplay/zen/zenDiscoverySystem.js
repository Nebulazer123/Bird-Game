/**
 * @module zenDiscoverySystem
 * Generates, places, and animates the nine zen note collectibles.
 * Notes are spaced along the ring course positions so following the rings
 * naturally leads the player past most notes. The final note is always near
 * the nest to encourage composition.
 */
import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

const ZEN_NOTE_COUNT = 9;
// Collection trigger radius; large enough to feel generous without being trivial.
const NOTE_COLLECT_RADIUS = 8.5;

/**
 * Builds the Three.js mesh for a single zen note: a glowing golden sphere
 * surrounded by a cyan torus halo ring for easy visual identification.
 */
function createZenNoteMesh() {
  const root = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfff3b1,
      emissive: 0xffd56f,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.08,
    }),
  );
  root.add(core);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.18, 10, 32),
    new THREE.MeshStandardMaterial({
      color: 0x9fe7ff,
      emissive: 0x9fe7ff,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      metalness: 0,
    }),
  );
  halo.rotation.x = Math.PI / 2;
  root.add(halo);

  root.userData = {
    core,
    halo,
  };

  return root;
}

/** Maps a note index to a musical tone name from a pentatonic-ish scale. */
function noteTone(index) {
  return ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'][index % ZEN_NOTE_COUNT];
}

/**
 * Distributes note positions alongside the ring course, staggered left/right so
 * they are easy to spot while flying the route. The last note is always relocated
 * near the nest to pull the player there for composition.
 */
export function generateZenDiscoveryLayout(game) {
  const notes = [];
  const ringPositions = game.courseData.ringPositions ?? [];
  const step = Math.max(1, Math.floor(ringPositions.length / ZEN_NOTE_COUNT));

  for (let index = 0; index < ZEN_NOTE_COUNT; index += 1) {
    const ringPoint = ringPositions[Math.min(ringPositions.length - 1, index * step)] ?? game.courseData.nestPosition;
    const offset = new THREE.Vector3(
      index % 2 === 0 ? 20 : -18,
      6 + (index % 3) * 4,
      index % 2 === 0 ? -14 : 18,
    );
    const position = ringPoint.clone().add(offset);
    // Ensure each note floats visibly above the terrain, never buried.
    position.y = Math.max(position.y, game.heightAt(position.x, position.z) + 12);
    notes.push({
      id: `note-${index + 1}`,
      label: `Sky Note ${index + 1}`,
      tone: noteTone(index),
      position,
      collected: false,
      mesh: null,
      baseY: position.y,
    });
  }

  const perchPosition = game.courseData.nestPosition.clone().add(new THREE.Vector3(-18, 10, -20));
  perchPosition.y = Math.max(perchPosition.y, game.heightAt(perchPosition.x, perchPosition.z) + 10);
  notes[notes.length - 1].position.copy(perchPosition);
  notes[notes.length - 1].baseY = perchPosition.y;
  notes[notes.length - 1].label = 'Perch Song';
  notes[notes.length - 1].tone = 'C6';

  game.courseData.zenNotes = notes;
  game.state.zen.notesTotal = notes.length;
}

/** Removes all zen note meshes from the scene and clears the notes array. */
export function clearZenDiscovery(game) {
  game.zenNotes.forEach((note) => {
    if (note.mesh) {
      game.scene.remove(note.mesh);
    }
  });
  game.zenNotes = [];
}

/** Clears the previous layout and builds fresh note meshes at the new positions. */
export function buildZenDiscovery(game) {
  clearZenDiscovery(game);
  generateZenDiscoveryLayout(game);

  game.zenNotes = game.courseData.zenNotes.map((note) => {
    const mesh = createZenNoteMesh();
    mesh.position.copy(note.position);
    game.scene.add(mesh);
    return {
      ...note,
      mesh,
    };
  });
}

/** Resets all zen collection progress without removing meshes from the scene. */
export function resetZenProgress(game) {
  game.state.zen.notesCollected = 0;
  game.state.zen.composed = false;
  game.state.zen.lastCollectedNote = null;
  game.state.zen.discoveryTargetId = null;
  game.state.zen.windGatesPassed = 0;
  Object.keys(game.state.zen.notesById).forEach((key) => {
    delete game.state.zen.notesById[key];
  });
}

/** Returns the first uncollected note, or null when all have been gathered. */
export function getNextZenTarget(game) {
  return game.zenNotes.find((note) => !note.collected) ?? null;
}

/**
 * Marks a note as collected, updates state counters, plays the note tone,
 * and advances the discovery target to the next uncollected note.
 * Returns false if the note does not exist or was already collected.
 */
export function collectZenNote(game, noteId) {
  const note = game.zenNotes.find((entry) => entry.id === noteId);
  if (!note || note.collected) return false;

  note.collected = true;
  if (note.mesh) {
    note.mesh.visible = false;
  }

  game.state.zen.notesById[noteId] = true;
  game.state.zen.notesCollected += 1;
  game.state.zen.lastCollectedNote = note.label;
  game.state.zen.discoveryTargetId = getNextZenTarget(game)?.id ?? null;
  game.playNoteCollect(note.tone);
  return true;
}

/**
 * Per-frame update for zen mode: animates each note's bob, rotation, and halo opacity,
 * and checks whether the bird is close enough to collect any note this frame.
 */
export function updateZenDiscovery(game, delta, elapsed) {
  if (game.features.mode !== 'zen') return;

  const nextTarget = getNextZenTarget(game);
  game.state.zen.discoveryTargetId = nextTarget?.id ?? null;

  game.zenNotes.forEach((note, index) => {
    if (!note.mesh) return;
    if (note.collected) {
      note.mesh.visible = false;
      return;
    }

    note.mesh.visible = true;
    note.mesh.position.y = note.baseY + Math.sin(elapsed * 1.8 + index * 0.7) * 0.8;
    note.mesh.rotation.y += delta * 0.8;
    note.mesh.userData.core.scale.setScalar(1 + Math.sin(elapsed * 4 + index) * 0.06);
    note.mesh.userData.halo.material.opacity = lerp(
      note.mesh.userData.halo.material.opacity,
      0.72 + Math.sin(elapsed * 3 + index) * 0.08,
      clamp(delta * 6, 0, 1),
    );

    if (note.mesh.position.distanceTo(game.bird.root.position) <= NOTE_COLLECT_RADIUS) {
      collectZenNote(game, note.id);
    }
  });
}
