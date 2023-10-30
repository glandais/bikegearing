let cameraOffset = { x: 100, y: 300 };
let cameraZoom = 2;
let MAX_ZOOM = 50;
let MIN_ZOOM = 0.5;
let SCROLL_SENSITIVITY = 0.005;

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
    const diff = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    cameraOffset.x = previousCameraOffset.x + diff.x;
    cameraOffset.y = previousCameraOffset.y + diff.y;
  }
}

function adjustZoom(e) {
  if (!isDragging) {
    const deltaY = e.deltaY;
    zoomAmount = -deltaY * SCROLL_SENSITIVITY;
    const worldPosition = getWorldPosition(e);
    cameraZoom += zoomAmount;
    cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

    // worldPosition.x = (e.clientX - cameraOffset.x) / cameraZoom
    // worldPosition.x * cameraZoom = e.clientX - cameraOffset.x
    // worldPosition.x * cameraZoom + cameraOffset.x = e.clientX
    cameraOffset.x = e.clientX - worldPosition.x * cameraZoom
    cameraOffset.y = e.clientY - worldPosition.y * cameraZoom
  }
}

function resize() {
  //  drawing = document.getElementById("drawing");
  //  canvas.width = drawing.width;
  //  canvas.height = drawing.height;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // ...then set the internal size to match
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function initInteractive() {
  addEventListener("resize", (event) => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    resize();
  });
  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("wheel", adjustZoom);
}
