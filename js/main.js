class BikeGearingCogsMain {
  static get aup() {
    return (70 * Math.PI) / 180;
  }

  constructor(state, canvasId, onReset) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.interactive = new BikeGearingInteractive(this.canvas, this);
    this.interactive.initInteractive();

    this.state = state;

    this.rivetsCalculator = new BikeGearingRivetsCalculator(this.state);

    this.computer = new BikeGearingComputer(this.state, this.rivetsCalculator);
    this.drawer = new BikeGearingDrawer(
      this.ctx,
      this.state,
      this.rivetsCalculator,
      this.interactive
    );

    this.onReset = onReset;
  }

  start() {
    this.previousChrono = 0;
    this.resetState();
    requestAnimationFrame((chrono) => this.frame(chrono));
  }

  frame(chrono) {
    if (this.previousChrono === undefined) {
      this.previousChrono = chrono;
    }
    if (!this.state.paused) {
      let dchrono = Math.max(1, chrono - this.previousChrono);
      this.state.fps = 1000 / dchrono;
      if (dchrono > 100) {
        dchrono = 16;
      }
      try {
        this.computer.compute(dchrono);
      } catch (e) {
        console.log(e);
        this.computer.resetComputer();
      }
      this.drawer.draw();
    } else {
      this.state.fps = 0;
    }
    this.previousChrono = chrono;
    requestAnimationFrame((chrono) => this.frame(chrono));
  }

  resetState() {
    this.state.reset();
    this.reset();
  }

  reset() {
    this.computer.resetComputer();
    this.computer.compute(0);
    this.onReset();
    this.interactive.resetInteractive();
  }

  drawIfPaused() {
    if (this.state.paused) {
      this.drawer.draw();
    }
  }

  compute0() {
    this.computer.moduloState();
    this.computer.compute(0);
    this.drawer.draw();
  }
}
