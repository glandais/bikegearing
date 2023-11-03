import BikeGearingState from "./state.js";
import BikeGearingMain from "./main.js";
import BikeGearingUi from "./ui.js";

function initBikeGearing() {
  let state = new BikeGearingState();
  /** @type {BikeGearingUi} */
  let ui = null;
  let main = new BikeGearingMain(state, "canvas", () => ui.update());
  ui = new BikeGearingUi(state, main);
  main.start();
}

window.initBikeGearing = initBikeGearing;
