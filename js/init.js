function init() {
  let state = new BikeGearingState();
  let ui = null;
  let main = new BikeGearingCogsMain(state, "canvas", () => ui.update());
  ui = new BikeGearingUi(state, main);
  main.start();
}
