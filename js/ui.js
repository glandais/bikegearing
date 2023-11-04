import BikeGearingInteractive from "./interactive.js";
import BikeGearingMain from "./main.js";
import { roundHuman } from "./math.js";
import BikeGearingState from "./state.js";
import { BikeGearingInputCheckbox, BikeGearingInputRange } from "./ui_input.js";

class BikeGearingUi {
  /**
   * @param {BikeGearingState} state
   * @param {BikeGearingMain} main
   * @param {BikeGearingInteractive} interactive
   */
  constructor(state, main, interactive) {
    this.state = state;
    this.main = main;
    this.interactive = interactive;

    this.inputs = [];
  }

  init() {
    this.initInputs();
    document
      .getElementById("resetState")
      .addEventListener("click", () => this.resetState());

    this.sidebar = document.getElementById("sidebar");
    this.sidebarHeader = document.getElementById("sidebar-header");
    this.sidebarContent = document.getElementById("sidebar-content");
    this.sideBarVisible = true;

    this.sidebarHeader.addEventListener("mousedown", (e) =>
      this.onSidebarDown(e),
    );
    this.sidebarHeader.addEventListener("touchstart", (e) =>
      this.onSidebarDown(e),
    );
    this.sidebarHeaderButton = document.getElementById("sidebar-header-button");
    this.sidebarHeaderButton.addEventListener("click", () =>
      this.switchSidebar(),
    );
    this.sidebarHeaderButton.addEventListener("touchend", () =>
      this.switchSidebar(),
    );

    window.addEventListener("resize", (e) => this.onResize());

    let sidebarContentRect = this.sidebarContent.getBoundingClientRect();
    this.initialSidebarContentHeight = sidebarContentRect.height;
    this.initialSidebarContentWidth = sidebarContentRect.width;
    let sidebarRect = this.sidebar.getBoundingClientRect();
    this.initialSidebarHeight = sidebarRect.height;
    this.sidebarContent.style.height = this.initialSidebarContentHeight + "px";

    let bodyRect = document.body.getBoundingClientRect();
    if (bodyRect.height < this.initialSidebarContentHeight) {
      this.sideBarVisible = false;
    }
    if (bodyRect.width < 2 * this.initialSidebarContentWidth) {
      this.sideBarVisible = false;
      this.sidebar.style.top = bodyRect.height + "px";
    }
    this.onSidebarVisibleChanged();
    if (this.sideBarVisible) {
      this.interactive.onSidebar(sidebarRect.width);
    }
  }

  initInputs() {
    this.inputs.push(
      new BikeGearingInputRange(
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
      new BikeGearingInputRange(
        "simulationSpeed",
        (v) => roundHuman(v, 0) + "%",
        () => this.state.simulationSpeed,
        (v) => (this.state.simulationSpeed = v),
        (v) => v / 100.0,
        (v) => v * 100.0,
      ),
    );

    this.inputs.push(
      new BikeGearingInputRange(
        "rotationSpeed",
        (v) => roundHuman(v, 1) + "rpm",
        () => this.state.rotationSpeed,
        (v) => (this.state.rotationSpeed = v),
      ),
    );
    this.inputs.push(
      new BikeGearingInputRange(
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
      new BikeGearingInputRange(
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
      new BikeGearingInputRange(
        "cl",
        (v) => "" + v,
        () => this.state.cl,
        (cl) => this.setCl(cl),
      ),
    );

    let cs1, cs2;
    cs1 = new BikeGearingInputRange(
      "cs1",
      (v) => roundHuman(this.state.cs, 2) + "mm",
      () => Math.floor(this.state.cs),
      (v) => {
        this.state.cs = v;
        cs2.reset();
        this.main.compute0();
      },
    );
    cs2 = new BikeGearingInputRange(
      "cs2",
      (v) => roundHuman(this.state.cs, 2) + "mm",
      () => 100.0 * (this.state.cs - Math.floor(this.state.cs)),
      (v) => {
        this.state.cs = Math.floor(this.state.cs) + v / 100;
        cs1.reset();
        this.main.compute0();
      },
    );
    this.inputs.push(cs1, cs2);

    this.inputs.push(
      new BikeGearingInputCheckbox(
        "doDrawWheel",
        () => this.state.doDrawWheel,
        (v) => {
          this.state.doDrawWheel = v;
          this.main.drawIfPaused();
        },
      ),
    );
    this.inputs.push(
      new BikeGearingInputCheckbox(
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
      new BikeGearingInputCheckbox(
        "switchDebug",
        () => this.state.debug,
        (v) => {
          this.state.debug = v;
          this.main.drawIfPaused();
        },
      ),
    );
    this.inputs.push(
      new BikeGearingInputCheckbox(
        "followRivet",
        () => this.state.followRivet,
        (v) => {
          this.state.followRivet = v;
          this.main.drawIfPaused();
        },
      ),
    );
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

  onResize() {
    this.computeSideBarBounds();
    let left = this.sidebar.offsetLeft;
    let top = this.sidebar.offsetTop;
    left = Math.max(this.sidebarMinLeft, Math.min(this.sidebarMaxLeft, left));
    top = Math.max(this.sidebarMinTop, Math.min(this.sidebarMaxTop, top));
    this.sidebar.style.left = left + "px";
    this.sidebar.style.top = top + "px";

    if (this.sideBarVisible) {
      if (this.bodyHeight < this.initialSidebarHeight) {
        let sidebarContentHeight =
          this.initialSidebarContentHeight -
          (this.initialSidebarHeight - this.bodyHeight);
        this.sidebarContent.style.height = sidebarContentHeight + "px";
      } else {
        this.sidebarContent.style.height =
          this.initialSidebarContentHeight + "px";
      }
    }
  }

  computeSideBarBounds() {
    let bodyRect = document.body.getBoundingClientRect();
    let sidebarRect = this.sidebar.getBoundingClientRect();
    this.bodyHeight = bodyRect.height;
    this.sidebarMinLeft = bodyRect.x;
    this.sidebarMaxLeft = bodyRect.x + bodyRect.width - sidebarRect.width;
    this.sidebarMinTop = bodyRect.y;
    this.sidebarMaxTop = bodyRect.y + bodyRect.height - sidebarRect.height;
  }

  onSidebarDown(e) {
    e.preventDefault();
    this.dragStart = this.getEventLocation(e);
    this.computeSideBarBounds();
    if (this.dragStart) {
      document.onmouseup = (e) => this.onWindowMouseUp(e);
      document.ontouchend = (e) => this.onWindowMouseUp(e);
      document.onmousemove = (e) => this.onWindowMouseMove(e);
      document.ontouchmove = (e) => this.onWindowMouseMove(e);
    }
  }

  onWindowMouseMove(e) {
    e.preventDefault();
    let dragEnd = this.getEventLocation(e);
    if (dragEnd) {
      let left = this.sidebar.offsetLeft + dragEnd.x - this.dragStart.x;
      let top = this.sidebar.offsetTop + dragEnd.y - this.dragStart.y;
      left = Math.max(this.sidebarMinLeft, Math.min(this.sidebarMaxLeft, left));
      top = Math.max(this.sidebarMinTop, Math.min(this.sidebarMaxTop, top));
      this.sidebar.style.left = left + "px";
      this.sidebar.style.top = top + "px";
      this.dragStart = dragEnd;
    }
  }

  onWindowMouseUp() {
    document.onmouseup = null;
    document.ontouchend = null;
    document.onmousemove = null;
    document.ontouchmove = null;
  }

  switchSidebar() {
    this.sideBarVisible = !this.sideBarVisible;
    this.onSidebarVisibleChanged();
  }

  onSidebarVisibleChanged() {
    if (this.sideBarVisible) {
      this.sidebarContent.style.height = "100%";
      this.sidebarHeaderButton.innerText = "▲";
      this.sidebarContent.style.height =
        this.initialSidebarContentHeight + "px";
    } else {
      this.sidebarContent.style.height = "0px";
      this.sidebarHeaderButton.innerText = "▼";
      this.sidebarContent.style.height = "0px";
    }
    this.onResize();
  }
}

export default BikeGearingUi;
