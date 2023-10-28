let cameraOffset = { x: 100, y: 300 };
let cameraZoom = 2;
let MAX_ZOOM = 20;
let MIN_ZOOM = 0.2;
let SCROLL_SENSITIVITY = 0.005;

function getEventLocation(e) {
  return { x: e.clientX, y: e.clientY };
}

let isDragging = false;
let dragStart = { x: 0, y: 0 };

let previousCameraOffset;

function onPointerDown(e) {
  isDragging = true;
  previousCameraOffset = { x: cameraOffset.x, y: cameraOffset.y };
  dragStart = getEventLocation(e);
}

function onPointerUp(e) {
  isDragging = false;
}

function onPointerMove(e) {
  if (isDragging) {
    const dragEnd = getEventLocation(e);
    const diff = {
      x: (dragEnd.x - dragStart.x),
      y: (dragEnd.y - dragStart.y),
    };
    cameraOffset.x = previousCameraOffset.x + diff.x;
    cameraOffset.y = previousCameraOffset.y + diff.y;
  }
}

function adjustZoom(zoomAmount) {
  if (!isDragging) {
    cameraZoom += zoomAmount;
    cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
  }
}

function initInteractive() {
  addEventListener("resize", (event) => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("wheel", (e) =>
    adjustZoom(-e.deltaY * SCROLL_SENSITIVITY)
  );
}
