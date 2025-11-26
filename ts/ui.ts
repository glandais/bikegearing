import BikeGearingInteractive from "./interactive.js";
import { roundHuman } from "./math.js";
import BikeGearingState from "./state.js";
import {
  BikeGearingInputCheckbox,
  BikeGearingInputRange,
} from "./ui_input.js";
import RatioFinderUi from "./ratio_finder_ui.js";
import type { Point } from "./types.js";

// Forward reference for BikeGearingMain to avoid circular dependency
interface MainInterface {
  resetState(): void;
  resetComputer(): void;
  compute0(): void;
  drawIfPaused(): void;
}

type InputType = BikeGearingInputRange | BikeGearingInputCheckbox;

export default class BikeGearingUi {
  state: BikeGearingState;
  main: MainInterface;
  interactive: BikeGearingInteractive;

  inputs: InputType[] = [];
  ratioFinder: RatioFinderUi;

  sidebar: HTMLElement | null = null;
  sidebarHeader: HTMLElement | null = null;
  sidebarContent: HTMLElement | null = null;
  sidebarHeaderButton: HTMLElement | null = null;
  sideBarVisible: boolean = true;

  initialSidebarContentHeight: number = 0;
  initialSidebarContentWidth: number = 0;
  initialSidebarHeight: number = 0;
  bodyHeight: number = 0;

  // Bounds for dragging
  sidebarMinLeft: number = 0;
  sidebarMaxLeft: number = 0;
  sidebarMinTop: number = 0;
  sidebarMaxTop: number = 0;

  dragStart: Point | undefined;

  constructor(
    state: BikeGearingState,
    main: MainInterface,
    interactive: BikeGearingInteractive
  ) {
    this.state = state;
    this.main = main;
    this.interactive = interactive;

    this.initInputs();

    this.ratioFinder = new RatioFinderUi(state, main, () => this.update());
  }

  init(): void {
    const resetBtn = document.getElementById("resetState");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetState());
    }

    this.sidebar = document.getElementById("sidebar");
    this.sidebarHeader = document.getElementById("sidebar-header");
    this.sidebarContent = document.getElementById("sidebar-content");

    if (this.sidebarHeader) {
      this.sidebarHeader.addEventListener("mousedown", (e) =>
        this.onSidebarDown(e)
      );
      this.sidebarHeader.addEventListener("touchstart", (e) =>
        this.onSidebarDown(e)
      );
    }

    this.sidebarHeaderButton = document.getElementById("sidebar-header-button");
    if (this.sidebarHeaderButton) {
      this.sidebarHeaderButton.addEventListener("click", () =>
        this.switchSidebar()
      );
      this.sidebarHeaderButton.addEventListener("touchend", () =>
        this.switchSidebar()
      );
    }

    window.addEventListener("resize", () => this.onResize());

    // Initialize ratio finder modal before measuring sidebar dimensions
    this.ratioFinder.init();

    if (this.sidebarContent && this.sidebar) {
      const sidebarContentRect = this.sidebarContent.getBoundingClientRect();
      this.initialSidebarContentHeight = sidebarContentRect.height;
      this.initialSidebarContentWidth = sidebarContentRect.width;
      const sidebarRect = this.sidebar.getBoundingClientRect();
      this.initialSidebarHeight = sidebarRect.height;
      this.sidebarContent.style.height = this.initialSidebarContentHeight + "px";

      const bodyRect = document.body.getBoundingClientRect();
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
  }

  initInputs(): void {
    this.inputs.push(
      new BikeGearingInputRange(
        "halfLinkChain",
        (v) => roundHuman(parseFloat(v), 1) + "%",
        () => this.state.halfLinkChain,
        (v) => {
          this.state.halfLinkChain = v;
          this.main.compute0();
        },
        (v) => 12.7 * ((100.0 + v) / 100.0),
        (v) => (100.0 * v) / 12.7 - 100
      )
    );
    this.inputs.push(
      new BikeGearingInputRange(
        "simulationSpeed",
        (v) => roundHuman(parseFloat(v), 0) + "%",
        () => this.state.simulationSpeed,
        (v) => (this.state.simulationSpeed = v),
        (v) => v / 100.0,
        (v) => v * 100.0
      )
    );

    this.inputs.push(
      new BikeGearingInputRange(
        "rotationSpeed",
        (v) => roundHuman(parseFloat(v), 1) + "rpm",
        () => this.state.rotationSpeed,
        (v) => (this.state.rotationSpeed = v)
      )
    );
    this.inputs.push(
      new BikeGearingInputRange(
        "f",
        (v) => "" + v,
        () => this.state.f,
        (v) => {
          this.state.f = v;
          this.main.resetComputer();
        }
      )
    );
    this.inputs.push(
      new BikeGearingInputRange(
        "r",
        (v) => "" + v,
        () => this.state.r,
        (v) => {
          this.state.r = v;
          this.main.resetComputer();
        }
      )
    );

    this.inputs.push(
      new BikeGearingInputRange(
        "cl",
        (v) => "" + v,
        () => this.state.cl,
        (cl) => this.setCl(cl)
      )
    );

    let cs1: BikeGearingInputRange;
    let cs2: BikeGearingInputRange;
    cs1 = new BikeGearingInputRange(
      "cs1",
      () => roundHuman(this.state.cs, 2) + "mm",
      () => Math.floor(this.state.cs),
      (v) => {
        this.state.cs = v;
        cs2.reset();
        this.main.compute0();
      }
    );
    cs2 = new BikeGearingInputRange(
      "cs2",
      () => roundHuman(this.state.cs, 2) + "mm",
      () => 100.0 * (this.state.cs - Math.floor(this.state.cs)),
      (v) => {
        this.state.cs = Math.floor(this.state.cs) + v / 100;
        cs1.reset();
        this.main.compute0();
      }
    );
    this.inputs.push(cs1, cs2);

    this.inputs.push(
      new BikeGearingInputCheckbox(
        "doDrawWheel",
        () => this.state.doDrawWheel,
        (v) => {
          this.state.doDrawWheel = v;
          this.main.drawIfPaused();
        }
      )
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
        }
      )
    );
    this.inputs.push(
      new BikeGearingInputCheckbox(
        "switchDebug",
        () => this.state.debug,
        (v) => {
          this.state.debug = v;
          this.main.drawIfPaused();
        }
      )
    );
    this.inputs.push(
      new BikeGearingInputCheckbox(
        "followRivet",
        () => this.state.followRivet,
        (v) => {
          this.state.followRivet = v;
          this.main.drawIfPaused();
        }
      )
    );
  }

  update(): void {
    this.inputs.forEach((input) => input.reset());
  }

  setCl(cl: number): void {
    const state = this.state;
    const dcl = cl - state.cl;
    const df = this.state.getRivetIndex(state.fru - state.frb);
    const dr = this.state.getRivetIndex(state.rrb - state.rru);
    state.cl = cl;
    if (state.rotationSpeed > 0) {
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

  resetState(): void {
    this.main.resetState();
  }

  getEventLocation(e: MouseEvent | TouchEvent): Point | undefined {
    if ("touches" in e && e.touches && e.touches.length === 1) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if ("clientX" in e && e.clientX && e.clientY) {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }
    return undefined;
  }

  onResize(): void {
    this.computeSideBarBounds();
    if (!this.sidebar) return;

    let left = this.sidebar.offsetLeft;
    let top = this.sidebar.offsetTop;
    left = Math.max(this.sidebarMinLeft, Math.min(this.sidebarMaxLeft, left));
    top = Math.max(this.sidebarMinTop, Math.min(this.sidebarMaxTop, top));
    this.sidebar.style.left = left + "px";
    this.sidebar.style.top = top + "px";

    if (this.sideBarVisible && this.sidebarContent) {
      if (this.bodyHeight < this.initialSidebarHeight) {
        const sidebarContentHeight =
          this.initialSidebarContentHeight -
          (this.initialSidebarHeight - this.bodyHeight);
        this.sidebarContent.style.height = sidebarContentHeight + "px";
      } else {
        this.sidebarContent.style.height =
          this.initialSidebarContentHeight + "px";
      }
    }
  }

  computeSideBarBounds(): void {
    if (!this.sidebar) return;
    const bodyRect = document.body.getBoundingClientRect();
    const sidebarRect = this.sidebar.getBoundingClientRect();
    this.bodyHeight = bodyRect.height;
    this.sidebarMinLeft = bodyRect.x;
    this.sidebarMaxLeft = bodyRect.x + bodyRect.width - sidebarRect.width;
    this.sidebarMinTop = bodyRect.y;
    this.sidebarMaxTop = bodyRect.y + bodyRect.height - sidebarRect.height;
  }

  onSidebarDown(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.dragStart = this.getEventLocation(e);
    this.computeSideBarBounds();
    if (this.dragStart) {
      document.onmouseup = () => this.onWindowMouseUp();
      document.ontouchend = () => this.onWindowMouseUp();
      document.onmousemove = (e) => this.onWindowMouseMove(e);
      document.ontouchmove = (e) => this.onWindowMouseMove(e);
    }
  }

  onWindowMouseMove(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    const dragEnd = this.getEventLocation(e);
    if (dragEnd && this.dragStart && this.sidebar) {
      let left = this.sidebar.offsetLeft + dragEnd.x - this.dragStart.x;
      let top = this.sidebar.offsetTop + dragEnd.y - this.dragStart.y;
      left = Math.max(this.sidebarMinLeft, Math.min(this.sidebarMaxLeft, left));
      top = Math.max(this.sidebarMinTop, Math.min(this.sidebarMaxTop, top));
      this.sidebar.style.left = left + "px";
      this.sidebar.style.top = top + "px";
      this.dragStart = dragEnd;
    }
  }

  onWindowMouseUp(): void {
    // Legacy cleanup for older event handling
    document.onmouseup = null;
    document.ontouchend = null;
    document.onmousemove = null;
    document.ontouchmove = null;
  }

  switchSidebar(): void {
    this.sideBarVisible = !this.sideBarVisible;
    this.onSidebarVisibleChanged();
  }

  onSidebarVisibleChanged(): void {
    if (!this.sidebarContent || !this.sidebarHeaderButton) return;

    if (this.sideBarVisible) {
      this.sidebarContent.style.height = "100%";
      this.sidebarHeaderButton.innerText = "\u25B2";
      this.sidebarContent.style.height =
        this.initialSidebarContentHeight + "px";
    } else {
      this.sidebarContent.style.height = "0px";
      this.sidebarHeaderButton.innerText = "\u25BC";
      this.sidebarContent.style.height = "0px";
    }
    this.onResize();
  }
}
