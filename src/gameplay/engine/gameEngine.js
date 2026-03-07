export class GameEngine {
  constructor(game, systems = []) {
    this.game = game;
    this.systems = Array.isArray(systems) ? systems : [];
  }

  setSystems(systems) {
    this.systems = Array.isArray(systems) ? systems : [];
  }

  start() {
    this.game.clock.start();
    this.game.renderer.setAnimationLoop(() => this.tick());
  }

  tick() {
    const delta = Math.min(this.game.clock.getDelta(), 1 / 20);
    const elapsed = this.game.clock.elapsedTime;
    this.game.previousBirdPosition.copy(this.game.bird.root.position);
    this.step(delta, elapsed);
    this.game.renderer.render(this.game.scene, this.game.camera);
  }

  step(delta, elapsed) {
    for (const system of this.systems) {
      system.update(this.game, delta, elapsed);
    }
  }
}

