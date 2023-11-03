function init() {
  let state = new BikeGearingState();
  let ui = null;
  let main = new BikeGearingMain(state, "canvas", () => ui.update());
  ui = new BikeGearingUi(state, main);
  main.start();
}
