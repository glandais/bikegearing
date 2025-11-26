import BikeGearingState from "./state.js";
import BikeGearingMain from "./main.js";
import BikeGearingUi from "./ui.js";

function initBikeGearing(): void {
  const state = new BikeGearingState();
  let ui: BikeGearingUi | null = null;
  const main = new BikeGearingMain(state, "canvas", () => ui?.update());
  ui = new BikeGearingUi(state, main, main.interactive);
  main.start();
  ui.init();
}

// Expose to global scope for HTML onload
declare global {
  interface Window {
    initBikeGearing: () => void;
  }
}

window.initBikeGearing = initBikeGearing;
