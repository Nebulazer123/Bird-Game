/**
 * @module gameEngine
 * Minimal game loop that drives a list of Systems each animation frame.
 * The engine owns the clock, caps the frame delta to avoid spiral-of-death
 * physics, and delegates per-frame work entirely to the registered systems.
 */

/** Orchestrates the main game loop and the ordered update of all systems. */
export class GameEngine {
  /**
   * @param {object}   game    - The BirdGame instance shared with every system.
   * @param {object[]} systems - Initial ordered list of systems to update each tick.
   */
  constructor(game, systems = []) {
    this.game = game;
    this.systems = Array.isArray(systems) ? systems : [];
  }

  /** Replaces the active system list; useful for transitioning between game states. */
  setSystems(systems) {
    this.systems = Array.isArray(systems) ? systems : [];
  }

  /** Starts the Three.js render loop, which calls tick() each animation frame. */
  start() {
    this.game.clock.start();
    this.game.renderer.setAnimationLoop(() => this.tick());
  }

  /** Called once per animation frame by the renderer loop. */
  tick() {
    // Cap delta at 50 ms (1/20 s) to prevent large physics jumps after tab switches.
    const delta = Math.min(this.game.clock.getDelta(), 1 / 20);
    const elapsed = this.game.clock.elapsedTime;
    // Snapshot the bird's world position before physics runs so ring-crossing
    // detection can compare previous vs current positions this frame.
    this.game.previousBirdPosition.copy(this.game.bird.root.position);
    this.step(delta, elapsed);
    this.game.renderer.render(this.game.scene, this.game.camera);
  }

  /** Runs one logical update step; can be called externally for scripted testing. */
  step(delta, elapsed) {
    // Each system receives the same (game, delta, elapsed) signature for consistency.
    for (const system of this.systems) {
      system.update(this.game, delta, elapsed);
    }
  }
}

