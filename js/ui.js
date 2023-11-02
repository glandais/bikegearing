class BikeGearingUi {
  constructor(state, main, rivetsCalculator) {
    this.state = state;
    this.main = main;
    this.rivetsCalculator = rivetsCalculator;
    this.sideBarVisible = true;

    document
      .getElementById("sidebar-btn")
      .addEventListener("click", () => this.switchSidebar());
    document
      .getElementById("halfLinkChain")
      .addEventListener("input", (e) => this.setHalfLinkChain(e));
    document
      .getElementById("simulationSpeed")
      .addEventListener("input", (e) => this.setSimulationSpeed(e));
    document
      .getElementById("rotationSpeed")
      .addEventListener("input", (e) => this.setRotationSpeed(e));
    document.getElementById("f").addEventListener("input", (e) => this.setF(e));
    document.getElementById("r").addEventListener("input", (e) => this.setR(e));
    document
      .getElementById("cs1")
      .addEventListener("input", (e) => this.setCs1());
    document
      .getElementById("cs1")
      .addEventListener("input", (e) => this.setCs2());
    document
      .getElementById("cl")
      .addEventListener("input", (e) => this.setCl(e));
    document
      .getElementById("doDrawWheel")
      .addEventListener("change", (e) => this.setDoDrawWheel(e));
    document
      .getElementById("switchPause")
      .addEventListener("change", (e) => this.switchPause(e));
    document
      .getElementById("switchDebug")
      .addEventListener("change", (e) => this.switchDebug(e));
    document
      .getElementById("followRivet")
      .addEventListener("change", (e) => this.setFollowRivet(e));
    document
      .getElementById("resetState")
      .addEventListener("click", () => this.resetState());
  }

  switchSidebar() {
    this.sideBarVisible = !this.sideBarVisible;
    if (this.sideBarVisible) {
      document.getElementById("sidebar").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      document.getElementById("sidebar-btn").innerText = "X";
    } else {
      document.getElementById("sidebar").style.width = "20px";
      document.getElementById("main").style.marginLeft = "20px";
      document.getElementById("sidebar-btn").innerText = ">";
    }
  }

  updateUI() {
    let state = this.state;
    let perc = (100.0 * state.halfLinkChain) / 12.7 - 100;
    document.getElementById("halfLinkChain").value = perc;
    document.getElementById("simulationSpeed").value = state.simulationSpeed;
    document.getElementById("rotationSpeed").value = state.rotationSpeed;
    document.getElementById("f").value = state.f;
    document.getElementById("r").value = state.r;
    document.getElementById("cs1").value = Math.floor(state.cs);
    document.getElementById("cs2").value =
      100.0 * (state.cs - Math.floor(state.cs));
    document.getElementById("cl").value = state.cl;
    document.getElementById("doDrawWheel").checked = state.doDrawWheel;
    document.getElementById("followRivet").checked = state.followRivet;
    document.getElementById("switchDebug").checked = state.debug;
    document.getElementById("switchPause").checked = state.paused;
  }

  setHalfLinkChain(e) {
    this.state.halfLinkChain = 12.7 * ((100.0 + 1.0 * e.target.value) / 100.0);
    this.main.compute0();
  }

  setSimulationSpeed(e) {
    this.state.simulationSpeed = 1.0 * e.target.value;
  }

  setRotationSpeed(e) {
    this.state.rotationSpeed = 1.0 * e.target.value;
  }

  setF(e) {
    this.state.f = 1.0 * e.target.value;
    this.main.reset();
  }

  setR(e) {
    this.state.r = 1.0 * e.target.value;
    this.main.reset();
  }

  setCs1() {
    this.state.cs = 1.0 * document.getElementById("cs1").value;
    document.getElementById("cs2").value = 0;
    this.main.compute0();
  }

  setCs2() {
    let cs1 = 1.0 * document.getElementById("cs1").value;
    let cs2 = (1.0 * document.getElementById("cs2").value) / 100.0;
    this.state.cs = cs1 + cs2;
    this.main.compute0();
  }

  setCl(e) {
    let cl = 1.0 * e.target.value;
    let state = this.state;
    let dcl = cl - state.cl;
    let df = this.rivetsCalculator.getRivetIndex(state.fru - state.frb);
    let dr = this.rivetsCalculator.getRivetIndex(state.rrb - state.rru);
    state.cl = cl;
    if (rotationSpeed > 0) {
      state.frb = state.frb + dcl;
      state.fru = state.frb + df;
      state.rru = state.rrb - dr;
    } else {
      state.rru = state.rru + dcl;
      state.rrb = state.rru + dr;
      state.frb = state.fru - df;
    }
    this.main.compute0();
  }

  setDoDrawWheel(e) {
    this.state.doDrawWheel = e.target.checked;
    this.main.drawIfPaused();
  }

  switchPause(e) {
    this.state.paused = e.target.checked;
    if (this.state.paused) {
      this.state.fps = 0;
    }
    this.main.drawIfPaused();
  }

  switchDebug(e) {
    this.state.debug = e.target.checked;
    this.main.drawIfPaused();
  }

  setFollowRivet(e) {
    this.state.followRivet = e.target.checked;
    this.main.drawIfPaused();
  }

  resetState() {
    this.main.resetState();
  }
}
