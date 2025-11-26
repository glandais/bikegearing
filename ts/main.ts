import BikeGearingInteractive from "./interactive.js";
import BikeGearingRivetsCalculator from "./rivet_calculator.js";
import BikeGearingComputer from "./computer.js";
import BikeGearingDrawer from "./drawer.js";
import BikeGearingState from "./state.js";
import type { Ctx2D } from "./types.js";

export default class BikeGearingMain {
  canvas: HTMLCanvasElement;
  interactive: BikeGearingInteractive;
  state: BikeGearingState;
  computer: BikeGearingComputer;
  drawer: BikeGearingDrawer;
  onReset: () => void;
  previousChrono: number = 0;

  constructor(state: BikeGearingState, canvasId: string, onReset: () => void) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d") as Ctx2D | null;
    if (!ctx) {
      throw new Error("Failed to get 2D rendering context");
    }

    this.interactive = new BikeGearingInteractive(this.canvas, this);
    this.interactive.initInteractive();

    this.state = state;

    const rivetsCalculator = new BikeGearingRivetsCalculator(this.state);

    this.computer = new BikeGearingComputer(this.state, rivetsCalculator);
    this.drawer = new BikeGearingDrawer(
      this.canvas,
      ctx,
      this.state,
      rivetsCalculator,
      this.interactive
    );

    this.onReset = onReset;
  }

  start(): void {
    this.previousChrono = 0;
    this.resetState();
    requestAnimationFrame((chrono) => this.frame(chrono));
  }

  frame(chrono: number): void {
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
        console.error("Physics computation error:", e);
        this.computer.reset();
        this.state.paused = true;
      }
      this.drawer.draw();
    } else {
      this.state.fps = 0;
    }
    this.previousChrono = chrono;
    requestAnimationFrame((chrono) => this.frame(chrono));
  }

  resetState(): void {
    this.state.reset();
    this.reset();
  }

  resetComputer(): void {
    this.computer.reset();
    this.computer.compute(0);
  }

  reset(): void {
    this.resetComputer();
    this.onReset();
    this.interactive.reset();
  }

  drawIfPaused(): void {
    if (this.state.paused) {
      this.drawer.draw();
    }
  }

  compute0(): void {
    this.computer.moduloState();
    this.computer.compute(0);
    this.drawer.draw();
  }
}
