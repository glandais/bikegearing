import BikeGearingMain from "./main.js";

// inspired from https://codepen.io/chengarda/pen/wRxoyB
class BikeGearingInteractive {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {BikeGearingMain} main
   */
  constructor(canvas, main) {
    this.canvas = canvas;
    this.main = main;

    this.maxZoom = 50;
    this.minZoom = 0.5;

    this.cameraOffset = { x: 172, y: 358 };
    this.cameraZoom = 2.0;
    this.worldWidth = 650;

    this.canvasBoundingClientRect = null;

    this.initialPinchDistance = null;
    this.initialPinchWorldPosition = null;
    this.initialPinchZoom = null;

    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.previousCameraOffset;
  }

  initInteractive() {
    let canvas = this.canvas;

    window.addEventListener("resize", (e) => this.onResize());
    canvas.addEventListener("mousedown", (e) => this.onPointerDown(e));
    canvas.addEventListener("touchstart", (e) =>
      this.handleTouch(e, (c) => this.onPointerDown(c)),
    );
    canvas.addEventListener("mouseup", (e) => this.onPointerUp(e));
    canvas.addEventListener("touchend", (e) =>
      this.handleTouch(e, (c) => this.onPointerUp(c)),
    );
    canvas.addEventListener("mousemove", (e) => this.onPointerMove(e));
    canvas.addEventListener("touchmove", (e) =>
      this.handleTouch(e, (c) => this.onPointerMove(c)),
    );
    canvas.addEventListener("wheel", (e) => this.adjustZoomWheel(e));
  }

  reset() {
    this.cameraOffset = { x: 172, y: 358 };
    this.cameraZoom = 2.0;
    this.worldWidth = 650;
    this.onResize();
  }

  onSidebar(width) {
    let worldPosition = this.getWorldPosition(
      0,
      0,
      this.cameraOffset,
      this.cameraZoom,
    );
    this.cameraZoom =
      (this.cameraZoom * (this.canvas.width - width)) / this.canvas.width;
    this.cameraOffset.x = width - worldPosition.x * this.cameraZoom;
  }

  onResize() {
    var parent = this.canvas.parentNode,
      styles = getComputedStyle(parent),
      w = parseInt(styles.getPropertyValue("width"), 10),
      h = parseInt(styles.getPropertyValue("height"), 10);
    this.canvas.width = w;
    this.canvas.height = h;

    this.canvasBoundingClientRect = this.canvas.getBoundingClientRect();
    let oldCameraZoom = this.cameraZoom;
    this.cameraZoom = this.canvas.width / this.worldWidth;
    this.cameraOffset.x =
      this.cameraOffset.x * (this.cameraZoom / oldCameraZoom);
    this.cameraOffset.y =
      this.cameraOffset.y * (this.cameraZoom / oldCameraZoom);
    this.main.drawIfPaused();
  }

  getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
      return {
        x: e.touches[0].clientX - this.canvasBoundingClientRect.left,
        y: e.touches[0].clientY - this.canvasBoundingClientRect.top,
      };
    } else if (e.clientX && e.clientY) {
      return {
        x: e.clientX - this.canvasBoundingClientRect.left,
        y: e.clientY - this.canvasBoundingClientRect.top,
      };
    }
  }

  onPointerDown(e) {
    this.isDragging = true;
    this.previousCameraOffset = {
      x: this.cameraOffset.x,
      y: this.cameraOffset.y,
    };
    this.dragStart = this.getEventLocation(e);
  }

  onPointerUp(e) {
    this.isDragging = false;
    this.initialPinchDistance = null;
    this.initialPinchWorldPosition = null;
    this.initialPinchZoom = null;
  }

  onPointerMove(e) {
    if (this.isDragging) {
      let eventLocation = this.getEventLocation(e);
      this.cameraOffset.x =
        this.previousCameraOffset.x + eventLocation.x - this.dragStart.x;
      this.cameraOffset.y =
        this.previousCameraOffset.y + eventLocation.y - this.dragStart.y;
      this.main.drawIfPaused();
    }
  }

  adjustZoomWheel(e) {
    if (!this.isDragging) {
      let eventLocation = this.getEventLocation(e);
      let worldPosition = this.getWorldPosition(
        eventLocation.x,
        eventLocation.y,
        this.cameraOffset,
        this.cameraZoom,
      );

      let sens = e.deltaY / 1000.0;
      let scale;
      if (e.deltaY >= 0) {
        scale = 1 - sens;
      } else {
        scale = 1 / (1 + sens);
      }
      this.adjustZoom(
        eventLocation.x,
        eventLocation.y,
        worldPosition,
        this.cameraZoom * scale,
      );
    }
  }

  getWorldPosition(clientX, clientY, offset, zoom) {
    return {
      x: (clientX - offset.x) / zoom,
      y: (clientY - offset.y) / zoom,
    };
  }

  adjustZoom(clientX, clientY, worldPosition, newCameraZoom) {
    if (!this.isDragging) {
      this.cameraZoom = newCameraZoom;
      this.cameraZoom = Math.min(this.cameraZoom, this.maxZoom);
      this.cameraZoom = Math.max(this.cameraZoom, this.minZoom);

      // worldPosition.x = (clientX - cameraOffset.x) / cameraZoom
      // worldPosition.x * cameraZoom = clientX - cameraOffset.x
      // worldPosition.x * cameraZoom + cameraOffset.x = clientX
      this.cameraOffset.x = clientX - worldPosition.x * this.cameraZoom;
      this.cameraOffset.y = clientY - worldPosition.y * this.cameraZoom;

      this.worldWidth = canvas.width / this.cameraZoom;

      this.main.drawIfPaused();
    }
  }

  handleTouch(e, singleTouchHandler) {
    if (e.touches.length == 1) {
      singleTouchHandler(e);
    } else if (e.type == "touchmove" && e.touches.length == 2) {
      this.isDragging = false;
      this.handlePinch(e);
    }
  }

  handlePinch(e) {
    e.preventDefault();

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
    let touchCenter = {
      x: (touch1.x + touch2.x) / 2 - this.canvasBoundingClientRect.left,
      y: (touch1.y + touch2.y) / 2 - this.canvasBoundingClientRect.top,
    };

    let currentDistance = Math.hypot(touch1.x - touch2.x, touch1.y - touch2.y);

    if (this.initialPinchDistance == null) {
      this.initialPinchDistance = currentDistance;
      this.initialPinchWorldPosition = this.getWorldPosition(
        touchCenter.x,
        touchCenter.y,
        this.cameraOffset,
        this.cameraZoom,
      );
      this.initialPinchZoom = this.cameraZoom;
    } else {
      this.adjustZoom(
        touchCenter.x,
        touchCenter.y,
        this.initialPinchWorldPosition,
        this.initialPinchZoom * (currentDistance / this.initialPinchDistance),
      );
    }
  }
}

export default BikeGearingInteractive;
