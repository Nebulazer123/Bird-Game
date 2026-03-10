import * as THREE from 'three';
import { GameAssets } from './gameAssets.js';
import { GameEngine } from './gameplay/engine/gameEngine.js';
import { createDefaultSystems } from './gameplay/engine/systems.js';
import {
  ASSET_URLS,
  BASE_RING_COUNT,
  BIRD_PROFILES,
  DEATH_ANIMATION_SECONDS,
  DOWN,
  ENEMY_BODY_RADIUS,
  ENEMY_BULLET_RADIUS,
  FEATHER_RING_STEP,
  FEATHER_SPEED_BONUS,
  FEATHER_YAW_BONUS,
  MPH_PER_SPEED,
  PLAYER_BULLET_RADIUS,
  RESPAWN_SHIELD_SECONDS,
  RING_CLEAR_RADIUS,
  RING_MAJOR_RADIUS,
  RING_TUBE_RADIUS,
  RINGS_PER_STAGE,
  SKILL_DATA,
  START_POSITION,
  WIN_ANIMATION_SECONDS,
  WORLD_LIMIT,
} from './gameplay/core/config.js';
import {
  formatTime,
  forwardFromAngles,
  seed,
  smoothFactor,
  wrapAngle,
} from './gameplay/core/math.js';
import {
  getInputState,
  isMovementKey,
  releaseTakeoffLock,
  resetMouseAim,
  setMouseAimFromPointer,
  syncReticle,
  updateAimState,
} from './gameplay/flight/input.js';
import {
  animateBird,
  resolveGround,
  updateBird,
  updateCooldowns,
} from './gameplay/flight/flightSystem.js';
import { getStats } from './gameplay/flight/stats.js';
import { updateCamera } from './gameplay/camera/cameraSystem.js';
import {
  buildStageCourse as buildStageCourseSystem,
  generateStageCourse as generateStageCourseSystem,
  positionNest as positionNestSystem,
} from './gameplay/objectives/courseBuilder.js';
import {
  activateFinale as activateFinaleSystem,
  canSafelyLandOnNest as canSafelyLandOnNestSystem,
  completeStage as completeStageSystem,
  getNestLandingPoint as getNestLandingPointSystem,
  setNestFinale as setNestFinaleSystem,
  updateNestFinale as updateNestFinaleSystem,
} from './gameplay/objectives/finaleSystem.js';
import {
  debugPassActiveRing as debugPassActiveRingSystem,
  didPassActiveRing as didPassActiveRingSystem,
  forceClearActiveRing as forceClearActiveRingSystem,
  updateCourse as updateCourseSystem,
  updateGuidanceArrow as updateGuidanceArrowSystem,
} from './gameplay/objectives/ringsSystem.js';
import {
  clearEnemies as clearEnemiesSystem,
  createEnemyEntity as createEnemyEntitySystem,
  forceEnemyInFront as forceEnemyInFrontSystem,
  forceEnemyNearPlayer as forceEnemyNearPlayerSystem,
  getPrimaryEnemy as getPrimaryEnemySystem,
  hitPrimaryEnemy as hitPrimaryEnemySystem,
  setPrimaryEnemyHealth as setPrimaryEnemyHealthSystem,
  spawnEnemyWave as spawnEnemyWaveSystem,
  updateEnemy as updateEnemySystem,
  updateEnemyHealthBar as updateEnemyHealthBarSystem,
  updateEnemyShowcase as updateEnemyShowcaseSystem,
} from './gameplay/combat/enemySystem.js';
import {
  firePlayerProjectile as firePlayerProjectileSystem,
  spawnEnemyProjectile as spawnEnemyProjectileSystem,
  updateProjectiles as updateProjectilesSystem,
} from './gameplay/combat/projectileSystem.js';
import {
  applyPlayerDamage as applyPlayerDamageSystem,
  respawnPlayer as respawnPlayerSystem,
  triggerPlayerDeath as triggerPlayerDeathSystem,
  updateDeathAnimation as updateDeathAnimationSystem,
  updateWinAnimation as updateWinAnimationSystem,
} from './gameplay/combat/damageSystem.js';
import {
  advanceStage as advanceStageSystem,
  applySkill as applySkillSystem,
  giveSkillPoint as giveSkillPointSystem,
} from './gameplay/progression/skills.js';
import { bindEvents as bindEventsSystem, bindUi as bindUiSystem } from './gameplay/ui/bindings.js';
import {
  toggleDebugPanel as toggleDebugPanelSystem,
  toggleGodMode as toggleGodModeSystem,
  togglePause as togglePauseSystem,
  toggleSkillMenu as toggleSkillMenuSystem,
  updateHud as updateHudSystem,
} from './gameplay/ui/hudSystem.js';
import { updateDebugPanel as updateDebugPanelSystem } from './gameplay/ui/debugPanelSystem.js';
import { updateEnvironment as updateEnvironmentSystem } from './gameplay/presentation/environmentSystem.js';
import { getDebugState as getDebugStateSystem, installDebugHooks as installDebugHooksSystem } from './gameplay/debug/debugBridge.js';
import { createAudioSystem, playAudioCue, playNoteCollect, syncAudioTuning, unlockAudio, updateAudio } from './gameplay/audio/audioSystem.js';
import { createGamepadState, loadGamepadRemap, saveGamepadRemap, updateGamepadState } from './gameplay/input/gamepadSystem.js';
import { createTuningPane } from './gameplay/debug/tuningPane.js';
import {
  buildZenDiscovery as buildZenDiscoverySystem,
  clearZenDiscovery as clearZenDiscoverySystem,
  collectZenNote as collectZenNoteSystem,
  resetZenProgress as resetZenProgressSystem,
  updateZenDiscovery as updateZenDiscoverySystem,
} from './gameplay/zen/zenDiscoverySystem.js';
import {
  canComposeAtNest as canComposeAtNestSystem,
  composeZenSong as composeZenSongSystem,
  updateZenCompletion as updateZenCompletionSystem,
} from './gameplay/zen/zenCompletionSystem.js';
import {
  VALLEY_LAYOUT,
  authoredHeightAt,
  sampleFlightLane,
  sampleRiverState,
} from './gameplay/presentation/valleyLayout.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

export class BirdGame {
  constructor(ui) {
    this.ui = ui;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x8bc6de, 180, 760);

    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1400);
    this.camera.position.set(-128, 34, -26);
    this.cameraTarget = new THREE.Vector3();

    this.renderer = new THREE.WebGLRenderer({
      canvas: ui.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(ui.root.clientWidth, ui.root.clientHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.assets = new GameAssets(this.renderer);
    this.models = {
      player: null,
      enemy: null,
      quaternius: {
        trees: [],
        deadTrees: [],
        rocks: [],
        pathRocks: [],
        foliage: [],
      },
      kenney: {
        trees: [],
        rocks: [],
        foliage: [],
      },
    };
    this.decor = [];

    this.keys = new Set();
    this.virtualInput = this.emptyInput();
    this.raycaster = new THREE.Raycaster();
    this.aimRaycaster = new THREE.Raycaster();
    this.tmpVector = new THREE.Vector3();
    this.tmpVector2 = new THREE.Vector3();
    this.tmpVector3 = new THREE.Vector3();
    this.tmpColor = new THREE.Color();
    this.worldMapRadius = WORLD_LIMIT;
    this.forwardVector = new THREE.Vector3();
    this.rightVector = new THREE.Vector3();
    this.previousBirdPosition = START_POSITION.clone();
    this.mouseAim = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      screenX: 0.5,
      screenY: 0.5,
    };

    this.courseRings = [];
    this.clouds = [];
    this.groundColliders = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.enemyIdCounter = 0;
    this.courseData = {
      ringPositions: [],
      nestPosition: new THREE.Vector3(),
      enemySpawns: [],
      zenNotes: [],
    };
    this.zenNotes = [];

    this.waterMaterial = null;
    this.water = null;
    this.waterSegments = [];
    this.terrain = null;
    this.perch = null;
    this.perchPlatform = null;
    this.perchGlow = null;
    this.nestLip = null;
    this.nestEggs = [];
    this.guidanceArrow = null;
    this.playerProjectileMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0a7,
      emissive: 0xffdd7f,
      emissiveIntensity: 0.95,
      roughness: 0.2,
      metalness: 0.2,
    });
    this.enemyProjectileMaterial = new THREE.MeshStandardMaterial({
      color: 0xff8f74,
      emissive: 0xff5f54,
      emissiveIntensity: 0.9,
      roughness: 0.26,
      metalness: 0.1,
    });
    this.debugLastShotAt = 0;

    this.features = {
      mode: 'zen',
      combatEnabled: false,
    };
    this.tuning = {
      camera: {
        distanceBase: 13,
        distanceSpeedScale: 0.06,
        followLag: 4.2,
        fovBoost: 8,
      },
      input: {
        deadzone: 0.12,
        aimSmoothing: 10,
      },
      audio: {
        masterVolume: 0.55,
      },
      zen: {
        windPocketStrength: 4.2,
        territoryDuration: 8,
      },
    };
    this.audio = createAudioSystem(this);
    this.gamepad = createGamepadState();

    this.frame = {
      delta: 0,
      elapsed: 0,
      uiFrozen: false,
      simulationDelta: 0,
    };

    this.state = {
      stage: 1,
      stageSeed: 1,
      totalRings: BASE_RING_COUNT,
      ringsCleared: 0,
      feathers: 0,
      score: 0,
      skillPoints: 0,
      unlockedSkills: {
        rapidBeak: false,
        piercingShot: false,
        tailwind: false,
        skyGrip: false,
        shellGuard: false,
        rebirthDraft: false,
      },
      activeRingIndex: 0,
      completed: false,
      autopilot: false,
      missionStartedAt: 0,
      finishTime: 0,
      lastGroundDistance: 999,
      raycastHits: 0,
      errors: [],
      health: 100,
      maxHealth: 100,
      selectedBirdId: 'parrot',
      paused: false,
      debugOpen: false,
      startOverlayOpen: false,
      showcaseMode: false,
      skillMenuOpen: false,
      godMode: false,
      awaitingTakeoff: true,
      spawnHoverY: START_POSITION.y,
      spawnHoverClock: 0,
      cameraZoom: 1,
      playerDeaths: 0,
      enemyKills: 0,
      enemyWave: 'patrol',
      finaleActive: false,
      pendingStageAdvance: false,
      deathAnimationTimer: 0,
      winAnimationTimer: 0,
      respawnShieldTimer: 0,
      feathersAwardedFromRings: 0,
      dangerWarning: '',
      tutorialPrompt: '',
      threatAngle: 0,
      threatLevel: 0,
      damageFlashTimer: 0,
      recentHitTimer: 0,
      damageDirectionAngle: 0,
      damageDirectionTimer: 0,
      recentPulseTimer: 0,
      territoryTimer: 0,
      territoryActive: false,
      windPulseTimer: 0,
      windPulseCooldown: 0,
      zen: {
        notesCollected: 0,
        notesTotal: 0,
        notesById: {},
        composed: false,
        lastCollectedNote: null,
        discoveryTargetId: null,
        windGatesPassed: 0,
      },
      tutorialUsage: {
        flap: 0,
        boost: 0,
        pulse: 0,
      },
      inputDiagnostics: {
        device: 'keyboard-mouse',
      },
    };

    this.sunLight = new THREE.DirectionalLight(0xfff1bf, 2.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.bias = -0.0002;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 260;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    this.sunLight.target.position.set(0, 0, 0);
    this.scene.add(this.sunLight, this.sunLight.target);

    this.scene.add(new THREE.HemisphereLight(0xc2f0ff, 0x3e5b36, 1.15));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.26));

    this.bird = this.createBird();
    this.scene.add(this.bird.root);
    this.applyBirdProfile();

    this.buildSky();
    this.buildWorld();
    this.bindUi();
    this.bindEvents();
    this.installDebugHooks();
    loadGamepadRemap(this);
    this.tuningPane = createTuningPane(this);
    this.onResize();
    this.resetMission();
    this.installVisualUpgrades();
    this.openStartOverlay(true);

    this.engine = new GameEngine(this, createDefaultSystems());
  }

  emptyInput() {
    return {
      forward: false,
      brake: false,
      left: false,
      right: false,
      flap: false,
      boost: false,
    };
  }

  buildSky() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1100, 48, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: new THREE.Color(0x8bd1ff) },
          horizonColor: { value: new THREE.Color(0xf9dcb2) },
          bottomColor: { value: new THREE.Color(0xfef6da) },
          sunDirection: { value: new THREE.Vector3(-0.4, 0.9, 0.1).normalize() },
          sunColor: { value: new THREE.Color(0xfff4bf) },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 horizonColor;
          uniform vec3 bottomColor;
          uniform vec3 sunDirection;
          uniform vec3 sunColor;
          varying vec3 vWorldPosition;

          void main() {
            vec3 dir = normalize(vWorldPosition);
            float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
            vec3 base = mix(bottomColor, horizonColor, smoothstep(0.0, 0.45, h));
            base = mix(base, topColor, smoothstep(0.42, 1.0, h));
            float sunGlow = pow(max(dot(dir, normalize(sunDirection)), 0.0), 48.0);
            vec3 color = base + sunColor * sunGlow * 0.85;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    );

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(14, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff3b4 }),
    );
    sun.position.set(-260, 240, -120);
    this.scene.add(sky, sun);
  }

  buildWorld() {
    this.terrain = this.createTerrain();
    this.scene.add(this.terrain);
    this.groundColliders.push(this.terrain);

    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x4aaad2,
      roughness: 0.2,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
      emissive: 0x2f8eaa,
      emissiveIntensity: 0.18,
    });

    this.createRiver();

    this.createTrees();
    this.createRocks();
    this.createFoliage();
    this.createBoundaryMountains();
    this.createClouds();
    this.createNest();
    this.createCliffSupports();
    this.createGuidanceArrow();
  }

  installVisualUpgrades() {
    this.loadSceneEnvironment();
    this.loadPlayerModel();
    this.loadEnemyModel();
    this.loadQuaterniusModels();
    this.loadKenneyModels();
  }

  async loadSceneEnvironment() {
    try {
      await this.assets.loadEnvironment(this.scene, {
        localHdr: ASSET_URLS.hdri.local,
        remoteHdr: ASSET_URLS.hdri.remote,
      });
    } catch {
      // Optional: no HDRI is still playable.
    }
  }

  async loadPlayerModel() {
    try {
      const gltf = await this.assets.loadCharacterModel({
        localGlb: ASSET_URLS.player.local,
        remoteGlb: ASSET_URLS.player.remote,
      });
      if (!gltf) return;
      this.models.player = gltf;
      this.refreshPlayerAvatar();
    } catch {
      // Optional: fallback to procedural bird.
    }
  }

  async loadEnemyModel() {
    try {
      const gltf = await this.assets.loadCharacterModel({
        localGlb: ASSET_URLS.enemy.local,
        remoteGlb: ASSET_URLS.enemy.remote,
      });
      if (!gltf) return;
      this.models.enemy = gltf;
      this.applyEnemyModelToAll();
    } catch {
      // Optional: fallback to procedural enemies.
    }
  }

  async loadQuaterniusModels() {
    const collect = async (url) => {
      try {
        const gltf = await this.assets.loadGlb(url);
        return gltf?.scene ? gltf.scene : null;
      } catch {
        return null;
      }
    };

    const [trees, deadTrees, rocks, pathRocks, foliage] = await Promise.all([
      Promise.all(ASSET_URLS.quaternius.trees.map(collect)),
      Promise.all(ASSET_URLS.quaternius.deadTrees.map(collect)),
      Promise.all(ASSET_URLS.quaternius.rocks.map(collect)),
      Promise.all(ASSET_URLS.quaternius.pathRocks.map(collect)),
      Promise.all(ASSET_URLS.quaternius.foliage.map(collect)),
    ]);

    this.models.quaternius.trees = trees.filter(Boolean);
    this.models.quaternius.deadTrees = deadTrees.filter(Boolean);
    this.models.quaternius.rocks = rocks.filter(Boolean);
    this.models.quaternius.pathRocks = pathRocks.filter(Boolean);
    this.models.quaternius.foliage = foliage.filter(Boolean);

    const hasAny = this.models.quaternius.trees.length
      + this.models.quaternius.deadTrees.length
      + this.models.quaternius.rocks.length
      + this.models.quaternius.pathRocks.length
      + this.models.quaternius.foliage.length > 0;
    if (!hasAny) return;

    this.rebuildDecor();
  }

  async loadKenneyModels() {
    const collect = async (url) => {
      try {
        const gltf = await this.assets.loadGlb(url);
        return gltf?.scene ? gltf.scene : null;
      } catch {
        return null;
      }
    };

    const [trees, rocks, foliage] = await Promise.all([
      Promise.all(ASSET_URLS.kenney.trees.map(collect)),
      Promise.all(ASSET_URLS.kenney.rocks.map(collect)),
      Promise.all(ASSET_URLS.kenney.foliage.map(collect)),
    ]);

    this.models.kenney.trees = trees.filter(Boolean);
    this.models.kenney.rocks = rocks.filter(Boolean);
    this.models.kenney.foliage = foliage.filter(Boolean);

    const hasAny = this.models.kenney.trees.length + this.models.kenney.rocks.length + this.models.kenney.foliage.length > 0;
    if (!hasAny) return;

    this.rebuildDecor();
  }

  rebuildDecor() {
    this.clearDecor();
    this.createTrees();
    this.createRocks();
    this.createFoliage();
    this.createBoundaryMountains();
    this.createClouds();
    this.createCliffSupports();
  }

  clearDecor() {
    this.decor.forEach((entry) => this.scene.remove(entry));
    this.decor = [];
    this.clouds = [];
  }

  normalizeVisual(model, { targetSize = 5, yRotation = Math.PI, yOffset = 0 } = {}) {
    model.rotation.set(0, yRotation, 0);
    model.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z, 0.0001);
    const scale = targetSize / maxAxis;

    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -center.y * scale + yOffset, -center.z * scale);
    model.updateMatrixWorld(true);
  }

  spawnPropFromTemplate(template, { position, scale = 1, rotationY = 0 } = {}) {
    const clone = template.clone(true);
    clone.rotation.y = rotationY;
    clone.scale.setScalar(scale);
    clone.position.copy(position);

    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
    });

    clone.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    clone.position.y += -bounds.min.y;

    this.scene.add(clone);
    this.decor.push(clone);
    return clone;
  }

  getSelectedBirdProfile() {
    return BIRD_PROFILES[this.state.selectedBirdId] ?? BIRD_PROFILES.parrot;
  }

  selectBird(birdId = 'parrot') {
    const nextId = BIRD_PROFILES[birdId] ? birdId : 'parrot';
    if (this.state.selectedBirdId === nextId) {
      this.updateBirdSelectionUi();
      return;
    }

    this.state.selectedBirdId = nextId;
    this.applyBirdProfile();
    this.updateBirdSelectionUi();
    this.updateHud();
  }

  updateBirdSelectionUi() {
    if (!this.ui.birdButtons?.length) return;
    const profile = this.getSelectedBirdProfile();
    this.ui.birdButtons.forEach((button) => {
      const active = button.dataset.bird === profile.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (this.ui.selectedBirdName) this.ui.selectedBirdName.textContent = profile.name;
    if (this.ui.selectedBirdSummary) this.ui.selectedBirdSummary.textContent = profile.summary;
  }

  openStartOverlay(forceValue) {
    const wantsOpen = typeof forceValue === 'boolean' ? forceValue : !this.state.startOverlayOpen;
    this.state.startOverlayOpen = wantsOpen;
    this.ui.startOverlay?.classList.toggle('is-hidden', !wantsOpen);
    if (wantsOpen) this.keys.clear();
    this.updateBirdSelectionUi();
  }

  startRun(selectedBirdId = this.state.selectedBirdId) {
    this.selectBird(selectedBirdId);
    this.openStartOverlay(false);
    this.resetMouseAim();
    this.keys.clear();
    this.updateHud();
  }

  applyBirdProfile() {
    const profile = this.getSelectedBirdProfile();
    const shape = profile.proceduralShape;
    const palette = profile.palette;

    this.bird.materials.plumage.color.set(palette.plumage);
    this.bird.materials.chest.color.set(palette.chest);
    this.bird.materials.beak.color.set(palette.beak);
    this.bird.materials.eye.color.set(palette.eye);

    this.bird.visual.scale.setScalar(shape.visualScale);
    this.bird.body.scale.fromArray(shape.bodyScale);
    this.bird.chestPatch.scale.fromArray(shape.chestScale);
    this.bird.chestPatch.position.fromArray(shape.chestPosition);
    this.bird.head.scale.fromArray(shape.headScale);
    this.bird.head.position.fromArray(shape.headPosition);
    this.bird.beakMesh.scale.fromArray(shape.beakScale);
    this.bird.beakMesh.position.fromArray(shape.beakPosition);
    this.bird.tail.scale.fromArray(shape.tailScale);
    this.bird.tail.position.fromArray(shape.tailPosition);
    this.bird.leftWingPivot.position.fromArray(shape.leftWingPivot);
    this.bird.rightWingPivot.position.set(-shape.leftWingPivot[0], shape.leftWingPivot[1], shape.leftWingPivot[2]);
    this.bird.leftWing.scale.fromArray(shape.wingScale);
    this.bird.leftWing.position.fromArray(shape.wingPosition);
    this.bird.rightWing.scale.fromArray(shape.wingScale);
    this.bird.rightWing.position.set(-shape.wingPosition[0], shape.wingPosition[1], shape.wingPosition[2]);

    this.refreshPlayerAvatar();
  }

  clearPlayerModel() {
    if (!this.bird.model) return;
    this.bird.root.remove(this.bird.model);
    this.bird.model = null;
    this.bird.mixer = null;
  }

  tintPlayerMaterial(material, tintHex) {
    if (!material?.clone) return material;
    const clone = material.clone();
    if (clone.color) {
      clone.color.multiply(new THREE.Color(tintHex));
    }
    clone.needsUpdate = true;
    return clone;
  }

  refreshPlayerAvatar() {
    const profile = this.getSelectedBirdProfile();
    const wantsModel = profile.modelStrategy === 'sharedModel' && Boolean(this.models.player);

    this.clearPlayerModel();
    this.bird.visual.visible = !wantsModel;
    if (wantsModel) {
      this.applyPlayerModel();
    }
  }

  applyPlayerModel() {
    if (!this.models.player) return;
    const profile = this.getSelectedBirdProfile();

    const model = this.assets.cloneSkinned(this.models.player.scene);
    this.normalizeVisual(model, {
      targetSize: profile.stats.modelTargetSize,
      yRotation: 0,
      yOffset: profile.stats.modelYOffset,
    });
    model.scale.multiplyScalar(profile.stats.modelScaleMultiplier);
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material = node.material.map((material) => this.tintPlayerMaterial(material, profile.palette.tint));
          } else {
            node.material = this.tintPlayerMaterial(node.material, profile.palette.tint);
          }
        }
      }
    });

    this.bird.visual.visible = false;
    this.bird.model = model;
    this.bird.root.add(model);

    const clip = this.models.player.animations?.[0];
    if (clip) {
      this.bird.mixer = new THREE.AnimationMixer(model);
      this.bird.mixer.clipAction(clip).play();
    }
  }

  applyEnemyModelToAll() {
    if (!this.models.enemy) return;
    this.enemies.forEach((enemy) => this.applyEnemyModel(enemy));
  }

  applyEnemyModel(enemy) {
    if (!enemy || enemy.model || !this.models.enemy) return;

    const model = this.assets.cloneSkinned(this.models.enemy.scene);
    this.normalizeVisual(model, { targetSize: 7.4, yRotation: Math.PI, yOffset: -1.0 });
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = false;

      const mat = node.material;
      if (Array.isArray(mat)) {
        node.material = mat.map((m) => this.tintEnemyMaterial(m));
      } else {
        node.material = this.tintEnemyMaterial(mat);
      }
    });

    enemy.visual.visible = false;
    enemy.model = model;
    enemy.root.add(model);

    const clip = this.models.enemy.animations?.[0];
    if (clip) {
      enemy.mixer = new THREE.AnimationMixer(model);
      enemy.mixer.clipAction(clip).play();
    }
  }

  tintEnemyMaterial(material) {
    if (!material || !material.clone) return material;
    const clone = material.clone();
    if (clone.color) {
      clone.color.multiply(new THREE.Color('#b35a4e'));
    }
    if ('emissive' in clone && clone.emissive) {
      clone.emissive.multiply(new THREE.Color('#3b1a17'));
      clone.emissiveIntensity = Math.max(clone.emissiveIntensity ?? 0, 0.08);
    }
    clone.needsUpdate = true;
    return clone;
  }

  createRiver() {
    this.waterSegments.forEach((segment) => this.scene.remove(segment));
    this.waterSegments = [];

    for (let index = 0; index < VALLEY_LAYOUT.river.length - 1; index += 1) {
      const start = VALLEY_LAYOUT.river[index];
      const end = VALLEY_LAYOUT.river[index + 1];
      const startVec = new THREE.Vector3(start.x, start.y, start.z);
      const endVec = new THREE.Vector3(end.x, end.y, end.z);
      const direction = endVec.clone().sub(startVec);
      const length = direction.length();
      const width = lerp(start.width, end.width, 0.5);
      const mid = startVec.clone().lerp(endVec, 0.5);

      const segment = new THREE.Mesh(
        new THREE.PlaneGeometry(length, width, 1, 1),
        this.waterMaterial,
      );
      segment.rotation.x = -Math.PI / 2;
      segment.rotation.z = Math.atan2(direction.z, direction.x);
      segment.position.copy(mid);
      segment.receiveShadow = true;
      segment.userData.baseY = mid.y;
      this.scene.add(segment);
      this.waterSegments.push(segment);
    }

    this.water = this.waterSegments[0] ?? null;
  }

  createCliffSupports() {
    const rockTemplates = this.models.quaternius.rocks.length > 0
      ? this.models.quaternius.rocks
      : this.models.kenney.rocks;
    if (rockTemplates.length <= 0) return;

    VALLEY_LAYOUT.supports.forEach((anchor, index) => {
      const template = rockTemplates[index % rockTemplates.length];
      for (let stackIndex = 0; stackIndex < 3; stackIndex += 1) {
        const offset = stackIndex * 5.6;
        this.spawnPropFromTemplate(template, {
          position: new THREE.Vector3(
            anchor.x + (stackIndex - 1) * 3.2,
            anchor.y + offset,
            anchor.z + (stackIndex % 2 === 0 ? -2.2 : 2.2),
          ),
          scale: 3.6 - stackIndex * 0.5,
          rotationY: seed(index * 7 + stackIndex) * Math.PI * 2,
        });
      }
    });
  }

  createTerrain() {
    const geometry = new THREE.PlaneGeometry(1050, 1050, 220, 220);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const z = positions.getZ(index);
      const y = this.heightAt(x, z);

      positions.setY(index, y);

      const river = sampleRiverState(x);
      const riverDistance = Math.abs(z - river.z);
      const fertile = clamp((y - 5) / 68, 0, 1);
      this.tmpColor.setHSL(
        lerp(0.29, 0.18, fertile),
        lerp(0.36, 0.54, fertile),
        lerp(0.32, 0.52, fertile),
      );

      if (riverDistance < river.width * 0.7) {
        this.tmpColor.lerp(new THREE.Color(0xcab887), 0.58);
      } else if (y > 42) {
        this.tmpColor.lerp(new THREE.Color(0x887967), 0.38);
      }

      const valleyLine = Math.exp(-Math.pow(riverDistance / 34, 2));
      if (valleyLine > 0.52) {
        this.tmpColor.lerp(new THREE.Color(0xc4b589), 0.28 * valleyLine);
      }

      if (Math.abs(x) > 420 || Math.abs(z) > 420) {
        const edgeFade = clamp((Math.max(Math.abs(x), Math.abs(z)) - 420) / 120, 0, 1);
        this.tmpColor.lerp(new THREE.Color(0x9d8e6a), edgeFade * 0.42);
      }

      colors[index * 3] = this.tmpColor.r;
      colors[index * 3 + 1] = this.tmpColor.g;
      colors[index * 3 + 2] = this.tmpColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      metalness: 0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
  }

  heightAt(x, z) {
    return authoredHeightAt(x, z);
  }

  createBoundaryMountains() {
    const count = 28;
    const baseRadius = this.worldMapRadius + 35;

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const jitter = seed(index * 37.1 + 9.4) - 0.5;
      const radius = baseRadius + jitter * 34;
      const height = 58 + seed(index * 14.7 + 2.1) * 62;
      const width = 30 + seed(index * 23.8 + 5.3) * 26;

      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(width, height, 8),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.12, 0.24, 0.34 + seed(index * 12.3) * 0.08),
          roughness: 0.95,
          metalness: 0,
        }),
      );
      mountain.position.set(Math.cos(angle) * radius, height * 0.4 - 4, Math.sin(angle) * radius);
      mountain.rotation.y = angle + jitter * 0.4;
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      this.scene.add(mountain);
      this.decor.push(mountain);
    }
  }

  createBird() {
    const root = new THREE.Group();
    root.rotation.order = 'YXZ';
    const visual = new THREE.Group();
    root.add(visual);

    const plumage = new THREE.MeshStandardMaterial({
      color: 0x7e98c9,
      roughness: 0.64,
      metalness: 0.02,
    });
    const chest = new THREE.MeshStandardMaterial({
      color: 0xf5dfbd,
      roughness: 0.72,
      metalness: 0,
    });
    const beak = new THREE.MeshStandardMaterial({
      color: 0xe3a751,
      roughness: 0.68,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x101725,
      roughness: 0.6,
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), plumage);
    body.scale.set(1.65, 1.0, 2.0);
    body.castShadow = true;
    visual.add(body);

    const chestPatch = new THREE.Mesh(new THREE.SphereGeometry(0.92, 18, 18), chest);
    chestPatch.position.set(0, -0.16, 0.78);
    chestPatch.scale.set(1.25, 0.9, 1.15);
    chestPatch.castShadow = true;
    visual.add(chestPatch);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 20, 20), plumage);
    head.position.set(0, 0.42, 1.92);
    head.castShadow = true;
    visual.add(head);

    const beakMesh = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.72, 12), beak);
    beakMesh.rotation.x = Math.PI / 2;
    beakMesh.position.set(0, 0.26, 2.56);
    beakMesh.castShadow = true;
    visual.add(beakMesh);

    const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), dark);
    eyeLeft.position.set(-0.19, 0.5, 2.3);
    const eyeRight = eyeLeft.clone();
    eyeRight.position.x *= -1;
    visual.add(eyeLeft, eyeRight);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.4, 5), plumage);
    tail.rotation.x = -Math.PI / 2;
    tail.position.set(0, -0.05, -2.25);
    tail.scale.set(1.2, 1, 1.6);
    tail.castShadow = true;
    visual.add(tail);

    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-1.22, 0.22, 0.38);
    const leftWing = new THREE.Mesh(new THREE.SphereGeometry(0.82, 18, 14), plumage);
    leftWing.scale.set(2.4, 0.18, 1.22);
    leftWing.position.set(-1.62, 0, 0.18);
    leftWing.castShadow = true;
    leftWingPivot.add(leftWing);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(1.22, 0.22, 0.38);
    const rightWing = leftWing.clone();
    rightWing.position.x *= -1;
    rightWingPivot.add(rightWing);

    visual.add(leftWingPivot, rightWingPivot);
    root.scale.setScalar(1.5);

    return {
      root,
      visual,
      body,
      chestPatch,
      tail,
      head,
      beakMesh,
      eyeLeft,
      eyeRight,
      leftWingPivot,
      rightWing,
      leftWing,
      rightWingPivot,
      materials: {
        plumage,
        chest,
        beak,
        eye: dark,
      },
      model: null,
      mixer: null,
      shapeDefaults: {
        chestPosition: chestPatch.position.clone(),
        headPosition: head.position.clone(),
        beakPosition: beakMesh.position.clone(),
        tailPosition: tail.position.clone(),
        leftWingPivot: leftWingPivot.position.clone(),
        rightWingPivot: rightWingPivot.position.clone(),
        wingPosition: leftWing.position.clone(),
      },
      speed: 24,
      heading: 0.62,
      pitch: 0,
      verticalVelocity: 0,
      bank: 0,
      flapCycle: 0,
      flapCooldown: 0,
      boostCooldown: 0,
      dashTimer: 0,
      fireCooldown: 0,
      lastFlap: false,
    };
  }

  clearCourseMeshes() {
    this.courseRings.forEach((ring) => this.scene.remove(ring.group));
    this.courseRings = [];
    this.clearZenDiscovery();
  }

  clearEnemies() {
    clearEnemiesSystem(this);
  }

  createEnemyEntity(position, behavior = 'patrol') {
    return createEnemyEntitySystem(this, position, behavior);
  }

  spawnEnemyWave(mode = 'patrol') {
    spawnEnemyWaveSystem(this, mode);
  }

  spawnClusteredProps(clusters, templates, {
    spreadScale = 1,
    scaleMin = 1,
    scaleMax = 1,
    yLift = 0,
  } = {}) {
    if (templates.length <= 0) return;

    clusters.forEach((cluster, clusterIndex) => {
      for (let index = 0; index < cluster.count; index += 1) {
        const scatterSeed = clusterIndex * 200 + index * 13;
        const x = cluster.x + (seed(scatterSeed + 1) - 0.5) * cluster.spreadX * spreadScale;
        const z = cluster.z + (seed(scatterSeed + 2) - 0.5) * cluster.spreadZ * spreadScale;
        const y = this.heightAt(x, z) + yLift;
        const rotationY = seed(scatterSeed + 3) * Math.PI * 2;
        const scale = lerp(scaleMin, scaleMax, seed(scatterSeed + 4));
        const template = templates[(clusterIndex + index) % templates.length];
        this.spawnPropFromTemplate(template, {
          position: new THREE.Vector3(x, y, z),
          scale,
          rotationY,
        });
      }
    });
  }

  templateMatchesName(template, pattern) {
    let matched = false;
    template.traverse((node) => {
      if (matched || !node.name) return;
      if (pattern.test(node.name)) matched = true;
    });
    return matched;
  }

  createTrees() {
    if (this.models.quaternius.trees.length > 0 || this.models.quaternius.deadTrees.length > 0) {
      const mixed = [
        ...this.models.quaternius.trees,
        ...this.models.quaternius.deadTrees,
      ];
      VALLEY_LAYOUT.treeGroves.forEach((grove, groveIndex) => {
        const familyTemplates = grove.family === 'dead'
          ? this.models.quaternius.deadTrees
          : grove.family === 'twisted'
            ? this.models.quaternius.trees.filter((_, index) => index >= 4)
            : grove.family === 'pine'
              ? this.models.quaternius.trees.filter((_, index) => index >= 3)
              : mixed;
        const templates = familyTemplates.length > 0 ? familyTemplates : mixed;
        this.spawnClusteredProps([{ ...grove }], templates, {
          scaleMin: grove.family === 'dead' ? 2.3 : 2.8,
          scaleMax: grove.family === 'pine' ? 4.8 : 4.2,
        });
      });
      return;
    }

    if (this.models.kenney.trees.length > 0) {
      for (let index = 0; index < 110; index += 1) {
        const x = lerp(-480, 480, seed(index * 2 + 1));
        const z = lerp(-480, 480, seed(index * 2 + 2));
        const valleyCenter = Math.sin((x + 120) * 0.012) * 44 + Math.sin(x * 0.023) * 10;
        const valleyDistance = Math.abs(z - valleyCenter);
        if (valleyDistance < 60) continue;

        const y = this.heightAt(x, z);
        if (y < 12) continue;

        const template = this.models.kenney.trees[index % this.models.kenney.trees.length];
        const scale = lerp(2.8, 4.9, seed(index * 5 + 3));
        const rotationY = seed(index * 5 + 4) * Math.PI * 2;
        this.spawnPropFromTemplate(template, {
          position: new THREE.Vector3(x, y, z),
          scale,
          rotationY,
        });
      }
      return;
    }

    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x7a5232,
      roughness: 0.96,
    });
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x5e8a4e,
      roughness: 0.94,
    });

    for (let index = 0; index < 160; index += 1) {
      const x = lerp(-480, 480, seed(index * 2 + 1));
      const z = lerp(-480, 480, seed(index * 2 + 2));
      const valleyCenter = Math.sin((x + 120) * 0.012) * 44 + Math.sin(x * 0.023) * 10;
      const valleyDistance = Math.abs(z - valleyCenter);
      if (valleyDistance < 60) continue;

      const y = this.heightAt(x, z);
      if (y < 12) continue;

      const height = lerp(8, 20, seed(index * 5 + 1));
      const crown = lerp(4, 9, seed(index * 5 + 2));

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, height, 8), trunkMaterial);
      trunk.position.y = height / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;

      const canopyOne = new THREE.Mesh(new THREE.ConeGeometry(crown, height * 0.72, 10), leafMaterial);
      canopyOne.position.y = height * 0.78;
      canopyOne.castShadow = true;

      const canopyTwo = canopyOne.clone();
      canopyTwo.scale.multiplyScalar(0.78);
      canopyTwo.position.y += height * 0.16;

      tree.add(trunk, canopyOne, canopyTwo);
      tree.position.set(x, y, z);
      const scale = lerp(0.7, 1.25, seed(index * 5 + 3));
      tree.scale.setScalar(scale);
      this.scene.add(tree);
      this.decor.push(tree);
    }
  }

  createRocks() {
    if (this.models.quaternius.rocks.length > 0) {
      this.spawnClusteredProps(VALLEY_LAYOUT.rockFields, this.models.quaternius.rocks, {
        scaleMin: 1.6,
        scaleMax: 3.8,
      });
      this.spawnClusteredProps(
        VALLEY_LAYOUT.riverRocks.map((entry) => ({
          x: entry.x,
          z: entry.z,
          spreadX: 18,
          spreadZ: 10,
          count: 3,
        })),
        this.models.quaternius.pathRocks.length > 0 ? this.models.quaternius.pathRocks : this.models.quaternius.rocks,
        {
          scaleMin: 1.1,
          scaleMax: 1.9,
          yLift: 0.2,
        },
      );
      return;
    }

    if (this.models.kenney.rocks.length > 0) {
      for (let index = 0; index < 45; index += 1) {
        const x = lerp(-420, 460, seed(index * 3 + 8));
        const z = lerp(-360, 340, seed(index * 3 + 9));
        const y = this.heightAt(x, z);
        if (y < 14) continue;

        const template = this.models.kenney.rocks[index % this.models.kenney.rocks.length];
        const scale = lerp(1.6, 3.4, seed(index * 4 + 1));
        const rotationY = seed(index * 4 + 2) * Math.PI * 2;
        this.spawnPropFromTemplate(template, {
          position: new THREE.Vector3(x, y, z),
          scale,
          rotationY,
        });
      }
      return;
    }

    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x7d817f,
      roughness: 0.88,
    });

    for (let index = 0; index < 34; index += 1) {
      const x = lerp(-420, 460, seed(index * 3 + 8));
      const z = lerp(-360, 340, seed(index * 3 + 9));
      const y = this.heightAt(x, z);
      if (y < 14) continue;

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(2, 5 + seed(index) * 4, 18 + seed(index + 12) * 18, 7), rockMaterial);
      spire.position.set(x, y + spire.geometry.parameters.height / 2 - 2, z);
      spire.rotation.z = seed(index * 4 + 12) * 0.16;
      spire.rotation.x = seed(index * 4 + 13) * 0.2;
      spire.castShadow = true;
      spire.receiveShadow = true;
      this.scene.add(spire);
      this.decor.push(spire);
    }
  }

  createFoliage() {
    if (this.models.quaternius.foliage.length > 0) {
      const grassTemplates = this.models.quaternius.foliage.filter((template) => this.templateMatchesName(template, /Grass_/i));
      const accentTemplates = this.models.quaternius.foliage.filter((template) => !this.templateMatchesName(template, /Grass_/i));
      const grassPatches = VALLEY_LAYOUT.meadowPatches.map((patch) => ({
        ...patch,
        count: Math.max(18, Math.round(patch.count * 2.2)),
        spreadX: patch.spreadX * 1.2,
        spreadZ: patch.spreadZ * 1.2,
      }));

      if (grassTemplates.length > 0) {
        this.spawnClusteredProps(grassPatches, grassTemplates, {
          scaleMin: 1.5,
          scaleMax: 3.1,
          yLift: 0.15,
        });
      }

      this.spawnClusteredProps(
        VALLEY_LAYOUT.meadowPatches,
        accentTemplates.length > 0 ? accentTemplates : this.models.quaternius.foliage,
        {
          scaleMin: 1.1,
          scaleMax: 2.4,
          yLift: 0.08,
        },
      );

      if (this.models.kenney.foliage.length > 0) {
        this.spawnClusteredProps(
          VALLEY_LAYOUT.meadowPatches.map((patch) => ({ ...patch, count: Math.max(4, Math.round(patch.count * 0.2)) })),
          this.models.kenney.foliage,
          {
            scaleMin: 0.9,
            scaleMax: 1.6,
          },
        );
      }
      return;
    }

    if (this.models.kenney.foliage.length <= 0) return;

    for (let index = 0; index < 160; index += 1) {
      const x = lerp(-490, 490, seed(index * 2 + 31));
      const z = lerp(-490, 490, seed(index * 2 + 32));
      const valleyCenter = Math.sin((x + 120) * 0.012) * 44 + Math.sin(x * 0.023) * 10;
      const valleyDistance = Math.abs(z - valleyCenter);
      if (valleyDistance < 55) continue;

      const y = this.heightAt(x, z);
      if (y < 10) continue;

      const template = this.models.kenney.foliage[index % this.models.kenney.foliage.length];
      const scale = lerp(1.1, 2.2, seed(index * 6 + 1));
      const rotationY = seed(index * 6 + 2) * Math.PI * 2;
      this.spawnPropFromTemplate(template, {
        position: new THREE.Vector3(x, y, z),
        scale,
        rotationY,
      });
    }
  }

  createClouds() {
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdf7ef,
      roughness: 1,
      transparent: true,
      opacity: 0.88,
    });

    for (let index = 0; index < 18; index += 1) {
      const cloud = new THREE.Group();
      const puffCount = 3 + Math.floor(seed(index * 7 + 1) * 3);
      for (let puffIndex = 0; puffIndex < puffCount; puffIndex += 1) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(6 + seed(index + puffIndex) * 4, 16, 12), cloudMaterial);
        puff.position.set((puffIndex - 1.5) * 5, seed(index * 5 + puffIndex) * 4, seed(index * 8 + puffIndex) * 5);
        cloud.add(puff);
      }

      cloud.position.set(
        lerp(-420, 460, seed(index * 9 + 2)),
        lerp(110, 190, seed(index * 9 + 3)),
        lerp(-340, 320, seed(index * 9 + 4)),
      );

      const scale = lerp(0.85, 1.8, seed(index * 9 + 5));
      cloud.scale.setScalar(scale);
      cloud.userData.velocity = lerp(2.5, 5, seed(index * 9 + 6));
      this.clouds.push(cloud);
      this.scene.add(cloud);
      this.decor.push(cloud);
    }
  }

  createCourse() {
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6b84b,
      emissive: 0xffb655,
      emissiveIntensity: 0.55,
      roughness: 0.44,
      metalness: 0.08,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff1b4,
      emissive: 0xffd98d,
      emissiveIntensity: 0.7,
      roughness: 0.36,
      metalness: 0.04,
    });

    for (let index = 0; index < this.courseData.ringPositions.length; index += 1) {
      const point = this.courseData.ringPositions[index];
      const target = this.courseData.ringPositions[index + 1] ?? this.courseData.nestPosition;
      const normal = target.clone().sub(point).normalize();
      const ring = new THREE.Group();

      const frame = new THREE.Mesh(new THREE.TorusGeometry(RING_MAJOR_RADIUS, RING_TUBE_RADIUS, 14, 40), ringMaterial.clone());
      frame.castShadow = true;
      frame.receiveShadow = true;
      ring.add(frame);

      const accent = new THREE.Mesh(new THREE.TorusGeometry(RING_MAJOR_RADIUS + 0.9, 0.16, 10, 40), accentMaterial.clone());
      accent.rotation.y = Math.PI / 2;
      ring.add(accent);

      ring.position.copy(point);
      ring.lookAt(target);
      ring.userData.phase = index * 0.73;
      this.scene.add(ring);

      this.courseRings.push({
        group: ring,
        frame,
        accent,
        normal,
        cleared: false,
        basePosition: point.clone(),
        captureTimer: 0,
        removing: false,
      });
    }
  }

  createNest() {
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x7a5437,
      roughness: 0.96,
    });
    const barkRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x8d613d,
      roughness: 0.88,
    });
    const nestMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7bf73,
      roughness: 0.92,
      emissive: 0xf8d687,
      emissiveIntensity: 0.18,
    });
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x658e52,
      roughness: 0.94,
      emissive: 0x6f944f,
      emissiveIntensity: 0.08,
    });
    const eggMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f4ea,
      emissive: 0xfff1b3,
      emissiveIntensity: 0.12,
      roughness: 0.68,
    });

    this.perch = new THREE.Group();
    this.perch.position.set(0, 0, 0);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(6, 8.5, 56, 10), trunkMaterial);
    trunk.position.y = 28;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.perch.add(trunk);

    for (let branchIndex = 0; branchIndex < 4; branchIndex += 1) {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 2.2, 18, 7), barkRingMaterial);
      branch.position.set(
        Math.cos(branchIndex * Math.PI / 2) * 8,
        38 + branchIndex * 1.6,
        Math.sin(branchIndex * Math.PI / 2) * 8,
      );
      branch.rotation.z = Math.PI / 2.7;
      branch.rotation.y = branchIndex * Math.PI / 2 + 0.35;
      branch.castShadow = true;
      this.perch.add(branch);
    }

    for (let canopyIndex = 0; canopyIndex < 3; canopyIndex += 1) {
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(13 - canopyIndex * 2, 16, 10), leafMaterial);
      canopy.position.y = 38 + canopyIndex * 7;
      canopy.castShadow = true;
      this.perch.add(canopy);
    }

    this.perchPlatform = new THREE.Mesh(new THREE.CylinderGeometry(9, 10.2, 2.4, 18), nestMaterial);
    this.perchPlatform.position.y = 56;
    this.perchPlatform.castShadow = true;
    this.perchPlatform.receiveShadow = true;
    this.perch.add(this.perchPlatform);

    this.nestLip = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.9, 10, 28), nestMaterial);
    this.nestLip.rotation.x = Math.PI / 2;
    this.nestLip.position.y = this.perchPlatform.position.y + 0.9;
    this.nestLip.castShadow = true;
    this.perch.add(this.nestLip);

    this.perchGlow = new THREE.Mesh(
      new THREE.TorusGeometry(10.2, 0.35, 10, 40),
      new THREE.MeshBasicMaterial({ color: 0xffefb0, transparent: true, opacity: 0.18 }),
    );
    this.perchGlow.rotation.x = Math.PI / 2;
    this.perchGlow.position.y = this.perchPlatform.position.y + 1.15;
    this.perchGlow.visible = false;
    this.perch.add(this.perchGlow);

    for (let eggIndex = 0; eggIndex < 3; eggIndex += 1) {
      const egg = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 16), eggMaterial.clone());
      egg.scale.set(0.8, 1.15, 0.8);
      egg.position.set((eggIndex - 1) * 2.2, this.perchPlatform.position.y + 1.2, eggIndex === 1 ? 1.1 : -0.3);
      egg.visible = false;
      egg.castShadow = true;
      this.perch.add(egg);
      this.nestEggs.push(egg);
    }

    this.scene.add(this.perch);
  }

  createGuidanceArrow() {
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xeaf6ff,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      depthTest: false,
    });
    const arrow = new THREE.Group();
    const backplate = new THREE.Mesh(
      new THREE.RingGeometry(0.24, 0.34, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        depthTest: false,
      }),
    );
    arrow.add(backplate);
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.25, 8),
      arrowMaterial,
    );
    shaft.rotation.z = Math.PI / 2;
    arrow.add(shaft);
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.68, 10),
      arrowMaterial.clone(),
    );
    head.rotation.z = -Math.PI / 2;
    head.position.x = 0.82;
    arrow.add(head);
    arrow.visible = true;
    this.guidanceArrow = arrow;
    this.camera.add(arrow);
    arrow.renderOrder = 999;
    arrow.scale.setScalar(0.9);
    arrow.position.set(0, 0.05, -1.35);
  }

  generateStageCourse(stage = this.state.stage) {
    generateStageCourseSystem(this, stage);
  }

  buildStageCourse() {
    buildStageCourseSystem(this);
  }

  positionNest() {
    positionNestSystem(this);
  }
  bindUi() {
    bindUiSystem(this);
  }

  bindEvents() {
    bindEventsSystem(this);
  }

  installDebugHooks() {
    installDebugHooksSystem(this);
  }

  getDebugState() {
    return getDebugStateSystem(this);
  }

  resetMission() {
    this.state.stage = 1;
    this.state.skillPoints = 0;
    Object.keys(this.state.unlockedSkills).forEach((skill) => {
      this.state.unlockedSkills[skill] = false;
    });
    this.applyBirdProfile();
    this.resetStage(true);
  }

  resetStage(fullReset = false) {
    this.features.combatEnabled = this.features.mode === 'challenge';
    this.state.ringsCleared = 0;
    this.state.feathers = 0;
    this.state.score = 0;
    this.state.activeRingIndex = 0;
    this.state.completed = false;
    this.state.autopilot = false;
    this.state.finishTime = 0;
    this.state.missionStartedAt = performance.now();
    this.state.lastGroundDistance = 999;
    this.state.raycastHits = 0;
    this.state.paused = false;
    this.state.skillMenuOpen = false;
    this.state.finaleActive = false;
    this.state.pendingStageAdvance = false;
    this.state.deathAnimationTimer = 0;
    this.state.winAnimationTimer = 0;
    this.state.respawnShieldTimer = 0;
    this.state.playerDeaths = 0;
    this.state.enemyKills = 0;
    this.state.enemyWave = 'patrol';
    this.state.feathersAwardedFromRings = 0;
    this.state.dangerWarning = '';
    this.state.tutorialPrompt = '';
    this.state.threatAngle = 0;
    this.state.threatLevel = 0;
    this.state.damageFlashTimer = 0;
    this.state.recentHitTimer = 0;
    this.state.damageDirectionAngle = 0;
    this.state.damageDirectionTimer = 0;
    this.state.recentPulseTimer = 0;
    this.state.territoryTimer = 0;
    this.state.territoryActive = false;
    this.state.windPulseTimer = 0;
    this.state.windPulseCooldown = 0;
    this.state.errors = [];
    resetZenProgressSystem(this);
    if (fullReset) {
      this.state.stageSeed = 1;
    }
    this.applyBirdProfile();
    this.getStats();
    this.state.health = this.state.maxHealth;
    this.buildStageCourse();
    this.buildZenDiscovery();
    this.setNestFinale(false);

    this.bird.root.position.copy(START_POSITION);
    this.state.awaitingTakeoff = true;
    this.state.spawnHoverY = this.bird.root.position.y;
    this.state.spawnHoverClock = 0;
    this.bird.speed = 0;
    this.bird.heading = 0.62;
    this.bird.pitch = 0;
    this.bird.verticalVelocity = 0;
    this.bird.bank = 0;
    this.bird.flapCycle = 0;
    this.bird.flapCooldown = 0;
    this.bird.boostCooldown = 0;
    this.bird.dashTimer = 0;
    this.bird.fireCooldown = 0;
    this.bird.lastFlap = false;
    this.bird.lastShoot = false;
    this.bird.lastPulse = false;
    this.bird.lastPause = false;
    this.resetMouseAim();
    this.playerProjectiles.forEach((shot) => this.scene.remove(shot.mesh));
    this.enemyProjectiles.forEach((shot) => this.scene.remove(shot.mesh));
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.ui.finishOverlay.classList.add('is-hidden');
    this.ui.pauseOverlay.classList.add('is-hidden');
    this.ui.skillOverlay.classList.add('is-hidden');
    if (this.state.startOverlayOpen) {
      this.ui.startOverlay.classList.remove('is-hidden');
    }
    this.updateBirdSelectionUi();
    this.updateHud();
  }

  getStats() {
    return getStats(this);
  }

  setMode(mode = 'zen') {
    const nextMode = mode === 'challenge' ? 'challenge' : 'zen';
    this.features.mode = nextMode;
    this.features.combatEnabled = nextMode === 'challenge';
    this.resetMission();
    this.updateHud();
  }

  start() {
    this.engine.start();
  }

  tick() {
    this.engine.tick();
  }

  step(delta, elapsed) {
    this.engine.step(delta, elapsed);
  }

  updateCooldowns(delta) {
    updateCooldowns(this, delta);
  }

  updateGamepadState() {
    return updateGamepadState(this);
  }

  getInputState() {
    return getInputState(this);
  }

  isMovementKey(code) {
    return isMovementKey(code);
  }

  releaseTakeoffLock() {
    releaseTakeoffLock(this);
  }

  resetMouseAim() {
    resetMouseAim(this);
  }

  setMouseAimFromPointer(clientX, clientY) {
    setMouseAimFromPointer(this, clientX, clientY);
  }

  syncReticle() {
    syncReticle(this);
  }

  updateAimState(delta) {
    return updateAimState(this, delta);
  }

  updateBird(delta) {
    updateBird(this, delta);
  }

  resolveGround(stats) {
    resolveGround(this, stats);
  }

  animateBird(delta) {
    animateBird(this, delta);
  }

  firePlayerProjectile() {
    return firePlayerProjectileSystem(this);
  }

  spawnEnemyProjectile(targetPosition, enemy) {
    spawnEnemyProjectileSystem(this, targetPosition, enemy);
  }

  updateProjectiles(delta) {
    updateProjectilesSystem(this, delta);
  }

  applyPlayerDamage(amount, source = 'attack', sourcePosition = null) {
    applyPlayerDamageSystem(this, amount, source, sourcePosition);
  }

  triggerPlayerDeath(source = 'ground') {
    triggerPlayerDeathSystem(this, source);
  }

  updateDeathAnimation(delta) {
    updateDeathAnimationSystem(this, delta);
  }

  updateWinAnimation(delta) {
    updateWinAnimationSystem(this, delta);
  }

  respawnPlayer() {
    respawnPlayerSystem(this);
  }

  getPrimaryEnemy() {
    return getPrimaryEnemySystem(this);
  }

  setPrimaryEnemyHealth(value) {
    setPrimaryEnemyHealthSystem(this, value);
  }

  hitPrimaryEnemy(amount = 1) {
    return hitPrimaryEnemySystem(this, amount);
  }

  forceEnemyNearPlayer() {
    forceEnemyNearPlayerSystem(this);
  }

  forceEnemyInFront() {
    forceEnemyInFrontSystem(this);
  }

  updateEnemy(delta, elapsed) {
    updateEnemySystem(this, delta, elapsed);
  }

  updateEnemyShowcase(delta, elapsed) {
    updateEnemyShowcaseSystem(this, delta, elapsed);
  }

  updateEnemyHealthBar(enemy) {
    updateEnemyHealthBarSystem(this, enemy);
  }

  didPassActiveRing(activeRing, previousPosition, currentPosition) {
    return didPassActiveRingSystem(this, activeRing, previousPosition, currentPosition);
  }

  forceClearActiveRing() {
    forceClearActiveRingSystem(this);
  }

  debugPassActiveRing() {
    return debugPassActiveRingSystem(this);
  }

  updateCourse(delta, elapsed) {
    updateCourseSystem(this, delta, elapsed);
  }

  buildZenDiscovery() {
    buildZenDiscoverySystem(this);
  }

  clearZenDiscovery() {
    clearZenDiscoverySystem(this);
  }

  updateZenDiscovery(delta, elapsed) {
    updateZenDiscoverySystem(this, delta, elapsed);
  }

  collectZenNote(noteId) {
    return collectZenNoteSystem(this, noteId);
  }

  canComposeAtNest() {
    return canComposeAtNestSystem(this);
  }

  composeZenSong() {
    return composeZenSongSystem(this);
  }

  updateZenCompletion() {
    updateZenCompletionSystem(this);
  }

  activateFinale() {
    activateFinaleSystem(this);
  }

  setNestFinale(active) {
    setNestFinaleSystem(this, active);
  }

  updateNestFinale(delta, elapsed) {
    updateNestFinaleSystem(this, delta, elapsed);
  }

  getNestLandingPoint() {
    return getNestLandingPointSystem(this);
  }

  canSafelyLandOnNest(hitPoint) {
    return canSafelyLandOnNestSystem(this, hitPoint);
  }

  completeStage() {
    completeStageSystem(this);
  }

  togglePause(forceValue) {
    togglePauseSystem(this, forceValue);
  }

  toggleDebugPanel(forceValue) {
    toggleDebugPanelSystem(this, forceValue);
  }

  updateDebugPanel() {
    updateDebugPanelSystem(this);
  }

  updateEnvironment(delta, elapsed) {
    updateEnvironmentSystem(this, delta, elapsed);
  }
  updateCamera(delta) {
    updateCamera(this, delta);
  }

  updateGuidanceArrow(delta) {
    updateGuidanceArrowSystem(this, delta);
  }

  updateHud() {
    updateHudSystem(this);
  }

  toggleSkillMenu(forceValue) {
    toggleSkillMenuSystem(this, forceValue);
  }

  applySkill(skill) {
    applySkillSystem(this, skill);
  }

  advanceStage() {
    advanceStageSystem(this);
  }

  giveSkillPoint(amount = 1) {
    giveSkillPointSystem(this, amount);
  }

  toggleGodMode(forceValue) {
    toggleGodModeSystem(this, forceValue);
  }

  unlockAudio() {
    unlockAudio(this);
  }

  syncAudioTuning() {
    syncAudioTuning(this);
  }

  updateAudio() {
    updateAudio(this);
  }

  playAudioCue(key) {
    playAudioCue(this, key);
  }

  playNoteCollect(tone) {
    playNoteCollect(this, tone);
  }

  saveGamepadRemap() {
    saveGamepadRemap(this);
  }

  spawnTerritoryMoment() {
    this.state.territoryActive = true;
    this.state.territoryTimer = this.tuning.zen.territoryDuration;
    this.features.combatEnabled = true;
    this.spawnEnemyWave('territory');
    this.playAudioCue('territory');
    this.updateHud();
  }

  triggerWindPulse() {
    const stats = this.getStats();
    if (this.state.windPulseCooldown > 0) return false;
    this.state.windPulseTimer = 0.45;
    this.state.windPulseCooldown = stats.windPulseCooldown;
    this.state.recentPulseTimer = 0.25;
    this.state.tutorialUsage.pulse += 1;
    this.playAudioCue('boost');
    return true;
  }

  // Debug-only showcase mode keeps both bird models framed for artifact capture.
  toggleShowcaseMode(forceValue) {
    const nextValue = typeof forceValue === 'boolean' ? forceValue : !this.state.showcaseMode;
    this.state.showcaseMode = nextValue;

    if (nextValue) {
      this.state.paused = false;
      this.state.skillMenuOpen = false;
      this.mouseAim.targetX = 0;
      this.mouseAim.targetY = 0;
      this.mouseAim.screenX = 0.5;
      this.mouseAim.screenY = 0.5;
      this.syncReticle();

      this.bird.root.position.copy(START_POSITION).add(new THREE.Vector3(0, 18, 0));
      this.bird.heading = 0.62;
      this.bird.pitch = 0;
      this.bird.speed = 0;
      this.bird.verticalVelocity = 0;

      if (this.enemies.length === 0) {
        this.spawnEnemyWave('patrol');
      }

      this.enemies.forEach((enemy, index) => {
        enemy.alive = true;
        enemy.root.visible = true;
        enemy.health = enemy.maxHealth;
        enemy.attackCooldown = 999;
        const angle = index * (Math.PI * 2 / Math.max(1, this.enemies.length));
        enemy.root.position
          .copy(this.bird.root.position)
          .add(new THREE.Vector3(Math.cos(angle) * 18, 4.5, Math.sin(angle) * 18));
        enemy.respawnPosition.copy(enemy.root.position);
        this.updateEnemyHealthBar(enemy);
      });
      this.applyEnemyModelToAll();
    } else {
      this.enemies.forEach((enemy) => {
        enemy.attackCooldown = 1.2;
      });
    }

    this.updateHud();
  }

  updateAutopilot(delta) {
    this.virtualInput = this.emptyInput();
    if (this.state.paused) return;
    if (this.state.skillMenuOpen) {
      return;
    }

    const target = this.state.activeRingIndex < this.state.totalRings
      ? this.courseRings[this.state.activeRingIndex].group.position
      : this.getNestLandingPoint();

    const toTarget = this.tmpVector.subVectors(target, this.bird.root.position);
    const horizontal = this.tmpVector2.set(toTarget.x, 0, toTarget.z);
    const distance = horizontal.length();
    const desiredHeading = Math.atan2(horizontal.x, horizontal.z);
    const headingError = wrapAngle(desiredHeading - this.bird.heading);

    const desiredPitch = clamp(Math.atan2(toTarget.y, Math.max(distance, 1)), -0.42, 0.38);
    const pitchError = desiredPitch - this.bird.pitch;

    this.mouseAim.targetX = clamp(headingError / 0.8, -1, 1);
    this.mouseAim.targetY = clamp(pitchError / 0.45, -1, 1);
    this.mouseAim.screenX = this.mouseAim.targetX * 0.5 + 0.5;
    this.mouseAim.screenY = 0.5 - this.mouseAim.targetY * 0.5;
    this.syncReticle();

    this.virtualInput.forward = distance > 16 || this.state.activeRingIndex < this.state.totalRings;
    this.virtualInput.brake =
      (this.state.activeRingIndex >= this.state.totalRings && distance < 20) ||
      this.bird.root.position.y > target.y + 5 ||
      (distance < 18 && toTarget.y < -4);

    const desiredAltitude = target.y + (distance > 18 ? 1.5 : -1.2);
    if (this.bird.root.position.y < desiredAltitude || this.state.lastGroundDistance < 6) {
      this.virtualInput.flap = true;
    }

    if (Math.abs(headingError) < 0.18 && distance > 34 && this.bird.boostCooldown <= 0 && this.state.activeRingIndex < this.state.totalRings) {
      this.virtualInput.boost = true;
    }

  }

  runScriptedCompletion() {
    while (this.state.activeRingIndex < this.state.totalRings) {
      const ring = this.courseRings[this.state.activeRingIndex];
      this.bird.root.position.copy(ring.group.position);
      this.bird.speed = this.getStats().cruiseSpeed;
      this.forceClearActiveRing();
    }

    const nestTarget = this.getNestLandingPoint();
    this.bird.root.position.copy(nestTarget);
    this.bird.speed = 10;
    this.updateCourse(0.016, this.clock.elapsedTime);
    if (this.state.skillPoints > 0) this.applySkill('rapidBeak');
  }

  onResize() {
    const width = this.ui.root.clientWidth;
    const height = this.ui.root.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
}



