import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const DEFAULT_TIMEOUT_MS = 12_000;

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

export class GameAssets {
  constructor(renderer) {
    this.renderer = renderer;
    this.gltfLoader = new GLTFLoader();
    this.rgbeLoader = new RGBELoader();
    this.cache = new Map();
    this.pmrem = new THREE.PMREMGenerator(renderer);
  }

  dispose() {
    this.pmrem?.dispose?.();
  }

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

  cloneSkinned(source) {
    return SkeletonUtils.clone(source);
  }

  async loadEnvironment(scene, { localHdr, remoteHdr } = {}) {
    const env = await tryUrlsSequentially([localHdr, remoteHdr], async (url) => this.loadHDR(url));
    if (!env) return false;
    scene.environment = env;
    return true;
  }

  async loadCharacterModel({ localGlb, remoteGlb } = {}) {
    const gltf = await tryUrlsSequentially([localGlb, remoteGlb], async (url) => this.loadGlb(url));
    if (!gltf || !gltf.scene) return null;
    return gltf;
  }
}
