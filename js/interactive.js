let cameraOffset;
let cameraZoom;
let worldWidth;

let canvasBoundingClientRect = null;

let initialPinchDistance = null;
let initialPinchWorldPosition = null;
let initialPinchZoom = null;

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let previousCameraOffset;

const MAX_ZOOM = 50;
const MIN_ZOOM = 0.5;
const SCROLL_SENSITIVITY = 0.005;

function getEventLocation(e) {
  if (e.touches && e.touches.length == 1) {
    return {
      x: e.touches[0].clientX - canvasBoundingClientRect.left,
      y: e.touches[0].clientY - canvasBoundingClientRect.top,
    };
  } else if (e.clientX && e.clientY) {
    return {
      x: e.clientX - canvasBoundingClientRect.left,
      y: e.clientY - canvasBoundingClientRect.top,
    };
  }
}

function onPointerDown(e) {
  isDragging = true;
  previousCameraOffset = { x: cameraOffset.x, y: cameraOffset.y };
  dragStart = getEventLocation(e);
}

function onPointerUp(e) {
  isDragging = false;
  initialPinchDistance = null;
  initialPinchWorldPosition = null;
  initialPinchZoom = null;
}

function onPointerMove(e) {
  if (isDragging) {
    let eventLocation = getEventLocation(e);
    cameraOffset.x = previousCameraOffset.x + eventLocation.x - dragStart.x;
    cameraOffset.y = previousCameraOffset.y + eventLocation.y - dragStart.y;
    drawIfPaused();
  }
}

function adjustZoomWheel(e) {
  if (!isDragging) {
    let eventLocation = getEventLocation(e);
    let worldPosition = getWorldPosition(
      eventLocation.x,
      eventLocation.y,
      cameraOffset,
      cameraZoom
    );
    adjustZoom(
      eventLocation.x,
      eventLocation.y,
      worldPosition,
      cameraZoom - e.deltaY * SCROLL_SENSITIVITY
    );
  }
}

function getWorldPosition(clientX, clientY, offset, zoom) {
  return {
    x: (clientX - offset.x) / zoom,
    y: (clientY - offset.y) / zoom,
  };
}

function adjustZoom(
  clientX,
  clientY,
  worldPosition,
  newCameraZoom
) {
  if (!isDragging) {
    cameraZoom = newCameraZoom;
    cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

    // worldPosition.x = (clientX - cameraOffset.x) / cameraZoom
    // worldPosition.x * cameraZoom = clientX - cameraOffset.x
    // worldPosition.x * cameraZoom + cameraOffset.x = clientX
    cameraOffset.x = clientX - worldPosition.x * cameraZoom;
    cameraOffset.y = clientY - worldPosition.y * cameraZoom;

    worldWidth = canvas.width / cameraZoom;

    drawIfPaused();
  }
}

function resetInteractive() {
  cameraOffset = { x: 172, y: 358 };
  cameraZoom = 2.0;
  worldWidth = 650;
  onResize();
}

function onResize() {
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  canvasBoundingClientRect = canvas.getBoundingClientRect();
  let oldCameraZoom = cameraZoom;
  cameraZoom = canvas.width / worldWidth;
  cameraOffset.x = cameraOffset.x * (cameraZoom / oldCameraZoom);
  cameraOffset.y = cameraOffset.y * (cameraZoom / oldCameraZoom);
  drawIfPaused();
}

function handleTouch(e, singleTouchHandler) {
  if (e.touches.length == 1) {
    singleTouchHandler(e);
  } else if (e.type == "touchmove" && e.touches.length == 2) {
    isDragging = false;
    handlePinch(e);
  }
}

function handlePinch(e) {
  e.preventDefault();

  let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
  let touchCenter = {
    x: (touch1.x + touch2.x) / 2 - canvasBoundingClientRect.left,
    y: (touch1.y + touch2.y) / 2 - canvasBoundingClientRect.top,
  }

  let currentDistance = Math.hypot(touch1.x - touch2.x, touch1.y - touch2.y);

  if (initialPinchDistance == null) {
    initialPinchDistance = currentDistance;
    initialPinchWorldPosition = getWorldPosition(
      touchCenter.x,
      touchCenter.y,
      cameraOffset,
      cameraZoom
    );
    initialPinchZoom = cameraZoom;
  } else {
    adjustZoom(
      touchCenter.x,
      touchCenter.y,
      initialPinchWorldPosition,
      initialPinchZoom * (currentDistance / initialPinchDistance)
    );
  }
}

function initInteractive() {
  addEventListener("resize", onResize);
  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("touchstart", (e) => handleTouch(e, onPointerDown));
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("touchend", (e) => handleTouch(e, onPointerUp));
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("touchmove", (e) => handleTouch(e, onPointerMove));
  canvas.addEventListener("wheel", adjustZoomWheel);
}
