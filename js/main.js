import BikeGearingInteractive from "./interactive.js";
import BikeGearingRivetsCalculator from "./rivet_calculator.js";
import BikeGearingComputer from "./computer.js";
import BikeGearingDrawer from "./drawer.js";
import BikeGearingState from "./state.js";

class BikeGearingMain {
  /**
   * @param {BikeGearingState} state
   * @param {string} canvasId
   * @param {Function} onReset
   */
  constructor(state, canvasId, onReset) {
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById(canvasId);
    /** @type {CanvasRenderingContext2D} */
    let ctx = this.canvas.getContext("2d");

    this.interactive = new BikeGearingInteractive(this.canvas, this);
    this.interactive.initInteractive();

    this.state = state;

    let rivetsCalculator = new BikeGearingRivetsCalculator(this.state);

    this.computer = new BikeGearingComputer(this.state, rivetsCalculator);
    this.drawer = new BikeGearingDrawer(
      this.canvas,
      ctx,
      this.state,
      rivetsCalculator,
      this.interactive,
    );

    /** @type {Function} */
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
        this.computer.reset();
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

  resetComputer() {
    this.computer.reset();
    this.computer.compute(0);
  }

  reset() {
    this.resetComputer();
    this.onReset();
    this.interactive.reset();
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

export default BikeGearingMain;
