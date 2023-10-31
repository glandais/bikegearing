let cameraOffset;
let cameraZoom;
let worldWidth;

const MAX_ZOOM = 50;
const MIN_ZOOM = 0.5;
const SCROLL_SENSITIVITY = 0.005;

function getWorldPosition(e) {
  return {
    x: (e.clientX - cameraOffset.x) / cameraZoom,
    y: (e.clientY - cameraOffset.y) / cameraZoom,
  };
}

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let previousCameraOffset;

function onPointerDown(e) {
  isDragging = true;
  previousCameraOffset = { x: cameraOffset.x, y: cameraOffset.y };
  dragStart = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
  isDragging = false;
}

function onPointerMove(e) {
  if (isDragging) {
    let diff = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    cameraOffset.x = previousCameraOffset.x + diff.x;
    cameraOffset.y = previousCameraOffset.y + diff.y;
    drawIfPaused();
  }
}

function adjustZoom(e) {
  if (!isDragging) {
    let deltaY = e.deltaY;
    zoomAmount = -deltaY * SCROLL_SENSITIVITY;
    let worldPosition = getWorldPosition(e);
    cameraZoom += zoomAmount;
    cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

    // worldPosition.x = (e.clientX - cameraOffset.x) / cameraZoom
    // worldPosition.x * cameraZoom = e.clientX - cameraOffset.x
    // worldPosition.x * cameraZoom + cameraOffset.x = e.clientX
    cameraOffset.x = e.clientX - worldPosition.x * cameraZoom
    cameraOffset.y = e.clientY - worldPosition.y * cameraZoom

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
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  let oldCameraZoom = cameraZoom;
  cameraZoom = canvas.width / worldWidth;
  cameraOffset.x = cameraOffset.x * (cameraZoom / oldCameraZoom);
  cameraOffset.y = cameraOffset.y * (cameraZoom / oldCameraZoom);
  drawIfPaused();
}

function initInteractive() {
  addEventListener("resize", onResize);
  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("wheel", adjustZoom);
}
