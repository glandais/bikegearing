import type { CameraOffset, Point } from "./types.js";

// Forward reference for BikeGearingMain to avoid circular dependency
interface MainInterface {
  drawIfPaused(): void;
}

export default class BikeGearingInteractive {
  canvas: HTMLCanvasElement;
  main: MainInterface;

  maxZoom: number = 50;
  minZoom: number = 0.5;

  cameraOffset: CameraOffset = { x: 172, y: 358 };
  cameraZoom: number = 2.0;
  worldWidth: number = 650;

  canvasBoundingClientRect: DOMRect | null = null;

  initialPinchDistance: number | null = null;
  initialPinchWorldPosition: Point | null = null;
  initialPinchZoom: number | null = null;

  isDragging: boolean = false;
  dragStart: Point = { x: 0, y: 0 };
  previousCameraOffset: CameraOffset | undefined;

  constructor(canvas: HTMLCanvasElement, main: MainInterface) {
    this.canvas = canvas;
    this.main = main;
  }

  initInteractive(): void {
    const canvas = this.canvas;

    window.addEventListener("resize", () => this.onResize());
    canvas.addEventListener("mousedown", (e) => this.onPointerDown(e));
    canvas.addEventListener("touchstart", (e) =>
      this.handleTouch(e, (c) => this.onPointerDown(c))
    );
    canvas.addEventListener("mouseup", (e) => this.onPointerUp(e));
    canvas.addEventListener("touchend", (e) =>
      this.handleTouch(e, (c) => this.onPointerUp(c))
    );
    canvas.addEventListener("mousemove", (e) => this.onPointerMove(e));
    canvas.addEventListener("touchmove", (e) =>
      this.handleTouch(e, (c) => this.onPointerMove(c))
    );
    canvas.addEventListener("wheel", (e) => this.adjustZoomWheel(e));
  }

  reset(): void {
    this.cameraOffset = { x: 172, y: 358 };
    this.cameraZoom = 2.0;
    this.worldWidth = 650;
    this.onResize();
  }

  onSidebar(width: number): void {
    const worldPosition = this.getWorldPosition(
      0,
      0,
      this.cameraOffset,
      this.cameraZoom
    );
    this.cameraZoom =
      (this.cameraZoom * (this.canvas.width - width)) / this.canvas.width;
    this.cameraOffset.x = width - worldPosition.x * this.cameraZoom;
  }

  onResize(): void {
    const parent = this.canvas.parentNode as HTMLElement;
    const styles = getComputedStyle(parent);
    const w = parseInt(styles.getPropertyValue("width"), 10);
    const h = parseInt(styles.getPropertyValue("height"), 10);
    this.canvas.width = w;
    this.canvas.height = h;

    this.canvasBoundingClientRect = this.canvas.getBoundingClientRect();
    const oldCameraZoom = this.cameraZoom;
    this.cameraZoom = this.canvas.width / this.worldWidth;
    this.cameraOffset.x =
      this.cameraOffset.x * (this.cameraZoom / oldCameraZoom);
    this.cameraOffset.y =
      this.cameraOffset.y * (this.cameraZoom / oldCameraZoom);
    this.main.drawIfPaused();
  }

  getEventLocation(e: MouseEvent | TouchEvent): Point | undefined {
    if ("touches" in e && e.touches && e.touches.length === 1) {
      return {
        x: e.touches[0].clientX - (this.canvasBoundingClientRect?.left ?? 0),
        y: e.touches[0].clientY - (this.canvasBoundingClientRect?.top ?? 0),
      };
    } else if ("clientX" in e && e.clientX && e.clientY) {
      return {
        x: e.clientX - (this.canvasBoundingClientRect?.left ?? 0),
        y: e.clientY - (this.canvasBoundingClientRect?.top ?? 0),
      };
    }
    return undefined;
  }

  onPointerDown(e: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.previousCameraOffset = {
      x: this.cameraOffset.x,
      y: this.cameraOffset.y,
    };
    const loc = this.getEventLocation(e);
    if (loc) {
      this.dragStart = loc;
    }
  }

  onPointerUp(_e: MouseEvent | TouchEvent): void {
    this.isDragging = false;
    this.initialPinchDistance = null;
    this.initialPinchWorldPosition = null;
    this.initialPinchZoom = null;
  }

  onPointerMove(e: MouseEvent | TouchEvent): void {
    if (this.isDragging && this.previousCameraOffset) {
      const eventLocation = this.getEventLocation(e);
      if (eventLocation) {
        this.cameraOffset.x =
          this.previousCameraOffset.x + eventLocation.x - this.dragStart.x;
        this.cameraOffset.y =
          this.previousCameraOffset.y + eventLocation.y - this.dragStart.y;
        this.main.drawIfPaused();
      }
    }
  }

  adjustZoomWheel(e: WheelEvent): void {
    if (!this.isDragging) {
      const eventLocation = this.getEventLocation(e);
      if (!eventLocation) return;

      const worldPosition = this.getWorldPosition(
        eventLocation.x,
        eventLocation.y,
        this.cameraOffset,
        this.cameraZoom
      );

      const sens = e.deltaY / 1000.0;
      let scale: number;
      if (e.deltaY >= 0) {
        scale = 1 - sens;
      } else {
        scale = 1 / (1 + sens);
      }
      this.adjustZoom(
        eventLocation.x,
        eventLocation.y,
        worldPosition,
        this.cameraZoom * scale
      );
    }
  }

  getWorldPosition(
    clientX: number,
    clientY: number,
    offset: CameraOffset,
    zoom: number
  ): Point {
    return {
      x: (clientX - offset.x) / zoom,
      y: (clientY - offset.y) / zoom,
    };
  }

  adjustZoom(
    clientX: number,
    clientY: number,
    worldPosition: Point,
    newCameraZoom: number
  ): void {
    if (!this.isDragging) {
      this.cameraZoom = newCameraZoom;
      this.cameraZoom = Math.min(this.cameraZoom, this.maxZoom);
      this.cameraZoom = Math.max(this.cameraZoom, this.minZoom);

      this.cameraOffset.x = clientX - worldPosition.x * this.cameraZoom;
      this.cameraOffset.y = clientY - worldPosition.y * this.cameraZoom;

      this.worldWidth = this.canvas.width / this.cameraZoom;

      this.main.drawIfPaused();
    }
  }

  handleTouch(
    e: TouchEvent,
    singleTouchHandler: (e: TouchEvent) => void
  ): void {
    if (e.touches.length === 1) {
      singleTouchHandler(e);
    } else if (e.type === "touchmove" && e.touches.length === 2) {
      this.isDragging = false;
      this.handlePinch(e);
    }
  }

  handlePinch(e: TouchEvent): void {
    e.preventDefault();

    const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
    const touchCenter = {
      x: (touch1.x + touch2.x) / 2 - (this.canvasBoundingClientRect?.left ?? 0),
      y: (touch1.y + touch2.y) / 2 - (this.canvasBoundingClientRect?.top ?? 0),
    };

    const currentDistance = Math.hypot(
      touch1.x - touch2.x,
      touch1.y - touch2.y
    );

    if (this.initialPinchDistance === null) {
      this.initialPinchDistance = currentDistance;
      this.initialPinchWorldPosition = this.getWorldPosition(
        touchCenter.x,
        touchCenter.y,
        this.cameraOffset,
        this.cameraZoom
      );
      this.initialPinchZoom = this.cameraZoom;
    } else if (this.initialPinchWorldPosition && this.initialPinchZoom) {
      this.adjustZoom(
        touchCenter.x,
        touchCenter.y,
        this.initialPinchWorldPosition,
        this.initialPinchZoom * (currentDistance / this.initialPinchDistance)
      );
    }
  }
}
