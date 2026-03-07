/**
 * @module gameAssets
 * Centralises all asset loading with local-first / remote fallback URL pairs,
 * a promise cache to prevent duplicate loads, and a PMREM generator for HDRI
 * environment maps. Designed to be resilient: assets are optional and the game
 * stays playable if they fail to load.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Default asset load timeout – generous enough for remote CDN latency.
const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * Races a promise against a timeout so stuck asset loads don't block the game forever.
 * Pass 0 / null to disable the timeout.
 */
function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (!timeoutMs) return promise;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const handle = setTimeout(() => {
        clearTimeout(handle);
        reject(new Error('Asset load timed out'));
      }, timeoutMs);
    }),
  ]);
}

/**
 * Tries each URL in sequence, returning the first successful result.
 * Failures are silently swallowed so the next URL is always attempted.
 */
function tryUrlsSequentially(urls, loadFn) {
  const list = Array.isArray(urls) ? urls : [urls];
  return list.reduce(async (previous, url) => {
    const previousResult = await previous;
    if (previousResult) return previousResult;
    try {
      return await loadFn(url);
    } catch {
      return null;
    }
  }, Promise.resolve(null));
}

/** Manages asset loading, caching, and HDRI environment generation for the game. */
export class GameAssets {
  /** @param {THREE.WebGLRenderer} renderer - Used to create the PMREM generator. */
  constructor(renderer) {
    this.renderer = renderer;
    this.gltfLoader = new GLTFLoader();
    this.rgbeLoader = new RGBELoader();
    this.cache = new Map();
    this.pmrem = new THREE.PMREMGenerator(renderer);
  }

  /** Frees GPU resources held by the PMREM generator. Call on scene teardown. */
  dispose() {
    this.pmrem?.dispose?.();
  }

  /**
   * Loads a GLB/GLTF file, caching the promise so repeated calls return the
   * same in-flight request rather than issuing duplicate network requests.
   */
  async loadGlb(url) {
    if (!url) return null;
    const cached = this.cache.get(url);
    if (cached) return cached;

    const promise = withTimeout(new Promise((resolve, reject) => {
      this.gltfLoader.load(url, resolve, undefined, reject);
    }));

    this.cache.set(url, promise);
    return promise;
  }

  /**
   * Loads an HDR file and converts it to a pre-filtered environment map texture
   * using the PMREM generator. The raw texture is disposed after processing to
   * free memory since only the pre-filtered version is needed.
   */
  async loadHDR(url) {
    if (!url) return null;
    const cached = this.cache.get(url);
    if (cached) return cached;

    const promise = withTimeout(new Promise((resolve, reject) => {
      this.rgbeLoader.load(url, resolve, undefined, reject);
    })).then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const env = this.pmrem.fromEquirectangular(texture).texture;
      texture.dispose();
      return env;
    });

    this.cache.set(url, promise);
    return promise;
  }

  /**
   * Clones a skinned mesh hierarchy so each instance has its own skeleton,
   * preventing shared bone transforms between multiple characters.
   */
  cloneSkinned(source) {
    return SkeletonUtils.clone(source);
  }

  /**
   * Loads an HDRI environment map and sets it on the scene, trying local then
   * remote URLs. Returns false if all sources fail.
   */
  async loadEnvironment(scene, { localHdr, remoteHdr } = {}) {
    const env = await tryUrlsSequentially([localHdr, remoteHdr], async (url) => this.loadHDR(url));
    if (!env) return false;
    scene.environment = env;
    return true;
  }

  /**
   * Loads a character GLB, trying local then remote URLs.
   * Returns null if no URL succeeds or if the GLTF has no scene node.
   */
  async loadCharacterModel({ localGlb, remoteGlb } = {}) {
    const gltf = await tryUrlsSequentially([localGlb, remoteGlb], async (url) => this.loadGlb(url));
    if (!gltf || !gltf.scene) return null;
    return gltf;
  }
}
