import BikeGearingMain from "./main.js";
import { roundHuman } from "./math.js";
import BikeGearingState from "./state.js";

class BikeGearingInput {
  constructor(
    id,
    toHuman,
    valueGetter,
    valueSetter,
    valueFromInput = (v) => v,
    valueToInput = (v) => v,
  ) {
    this.inputElement = document.getElementById(id);
    this.spanElement = document.getElementById(id + "Value");
    this.toHuman = toHuman;
    this.valueSetter = valueSetter;
    this.valueGetter = valueGetter;
    this.valueFromInput = valueFromInput;
    this.valueToInput = valueToInput;

    this.inputElement.addEventListener("input", (e) => this.onInput(e));
  }

  onInput(e) {
    this.valueSetter(this.valueFromInput(1.0 * e.target.value));
    this.setTextValue();
  }
  setInputValue() {
    this.inputElement.value = this.valueToInput(this.valueGetter());
  }
  setTextValue() {
    if (this.spanElement) {
      this.spanElement.innerText = this.toHuman(this.inputElement.value);
    }
  }
  reset() {
    this.setInputValue();
    this.setTextValue();
  }
}

class BikeGearingCheckbox {
  constructor(id, valueGetter, valueSetter) {
    this.inputElement = document.getElementById(id);
    this.valueSetter = valueSetter;
    this.valueGetter = valueGetter;

    this.inputElement.addEventListener("change", (e) =>
      this.valueSetter(e.target.checked),
    );
  }
  reset() {
    this.inputElement.checked = this.valueGetter();
  }
}

class BikeGearingUi {
  /**
   * @param {BikeGearingState} state
   * @param {BikeGearingMain} main
   */
  constructor(state, main) {
    this.state = state;
    this.main = main;

    this.sidebar = document.getElementById("sidebar");
    this.sidebarHeader = document.getElementById("sidebar-header");
    this.sidebarHeader.addEventListener("mousedown", (e) =>
      this.onSidebarDown(e),
    );
    this.sidebarHeader.addEventListener("touchstart", (e) =>
      this.onSidebarDown(e),
    );

    this.sideBarVisible = true;
    document
      .getElementById("sidebar-header-button")
      .addEventListener("click", () => this.switchSidebar());

    this.inputs = [];
    this.inputs.push(
      new BikeGearingInput(
        "halfLinkChain",
        (v) => roundHuman(v, 1) + "%",
        () => this.state.halfLinkChain,
        (v) => {
          this.state.halfLinkChain = v;
          this.main.compute0();
        },
        (v) => 12.7 * ((100.0 + v) / 100.0),
        (v) => (100.0 * v) / 12.7 - 100,
      ),
    );
    this.inputs.push(
      new BikeGearingInput(
        "simulationSpeed",
        (v) => roundHuman(v, 0) + "%",
        () => this.state.simulationSpeed,
        (v) => (this.state.simulationSpeed = v),
        (v) => v / 100.0,
        (v) => v * 100.0,
      ),
    );

    this.inputs.push(
      new BikeGearingInput(
        "rotationSpeed",
        (v) => roundHuman(v, 1) + "rpm",
        () => this.state.rotationSpeed,
        (v) => (this.state.rotationSpeed = v),
      ),
    );
    this.inputs.push(
      new BikeGearingInput(
        "f",
        (v) => "" + v,
        () => this.state.f,
        (v) => {
          this.state.f = v;
          this.main.resetComputer();
        },
      ),
    );
    this.inputs.push(
      new BikeGearingInput(
        "r",
        (v) => "" + v,
        () => this.state.r,
        (v) => {
          this.state.r = v;
          this.main.resetComputer();
        },
      ),
    );

    this.inputs.push(
      new BikeGearingInput(
        "cl",
        (v) => "" + v,
        () => this.state.cl,
        (cl) => this.setCl(cl),
      ),
    );

    let cs1 = new BikeGearingInput(
      "cs1",
      (v) => roundHuman(state.cs, 2) + "mm",
      () => Math.floor(this.state.cs),
      (v) => {
        this.state.cs = v;
        cs2.reset();
        this.main.compute0();
      },
    );
    let cs2 = new BikeGearingInput(
      "cs2",
      (v) => roundHuman(state.cs, 2) + "mm",
      () => 100.0 * (state.cs - Math.floor(state.cs)),
      (v) => {
        this.state.cs = Math.floor(this.state.cs) + v / 100;
        cs1.reset();
        this.main.compute0();
      },
    );
    this.inputs.push(cs1, cs2);

    this.inputs.push(
      new BikeGearingCheckbox(
        "doDrawWheel",
        () => this.state.doDrawWheel,
        (v) => {
          this.state.doDrawWheel = v;
          this.main.drawIfPaused();
        },
      ),
    );
    this.inputs.push(
      new BikeGearingCheckbox(
        "switchPause",
        () => this.state.paused,
        (v) => {
          this.state.paused = v;
          if (this.state.paused) {
            this.state.fps = 0;
          }
          this.main.drawIfPaused();
        },
      ),
    );
    this.inputs.push(
      new BikeGearingCheckbox(
        "switchDebug",
        () => this.state.debug,
        (v) => {
          this.state.debug = v;
          this.main.drawIfPaused();
        },
      ),
    );
    this.inputs.push(
      new BikeGearingCheckbox(
        "followRivet",
        () => this.state.followRivet,
        (v) => {
          this.state.followRivet = v;
          this.main.drawIfPaused();
        },
      ),
    );
    document
      .getElementById("resetState")
      .addEventListener("click", () => this.resetState());
  }

  update() {
    this.inputs.forEach((input) => input.reset());
  }

  setCl(cl) {
    let state = this.state;
    let dcl = cl - state.cl;
    let df = this.state.getRivetIndex(state.fru - state.frb);
    let dr = this.state.getRivetIndex(state.rrb - state.rru);
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

  resetState() {
    this.main.resetState();
  }

  getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.clientX && e.clientY) {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }
  }

  onSidebarDown(e) {
    e.preventDefault();
    this.dragStart = this.getEventLocation(e);
    if (this.dragStart) {
      document.onmouseup = (e) => this.onWindowMousUp(e);
      document.onmousemove = (e) => this.onWindowMouseMove(e);
    }
  }

  onWindowMouseMove(e) {
    e.preventDefault();
    let dragEnd = this.getEventLocation(e);
    if (dragEnd) {
      this.sidebar.style.left =
        this.sidebar.offsetLeft + dragEnd.x - this.dragStart.x + "px";
      this.sidebar.style.top =
        this.sidebar.offsetTop + dragEnd.y - this.dragStart.y + "px";
      this.dragStart = dragEnd;
    }
  }

  onWindowMousUp() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  switchSidebar() {
    this.sideBarVisible = !this.sideBarVisible;
    if (this.sideBarVisible) {
      document.getElementById("sidebar-content").style.height = "100%";
      document.getElementById("sidebar-header-button").innerText = "▲";
    } else {
      document.getElementById("sidebar-content").style.height = "0px";
      document.getElementById("sidebar-header-button").innerText = "▼";
    }
  }
}

export default BikeGearingUi;
