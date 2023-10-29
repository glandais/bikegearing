let canvas;
let ctx;

function printStateValues(values) {
  for (let i = 0; i < values.length; i++) {
    ctx.fillText(values[i], -100, -200 + 12 * i);
  }
}

function printState(state) {
  ctx.save();
  ctx.font = "12px serif";
  printStateValues([
    "f: " + state.f,
    "r: " + state.r,
    "cs: " + state.cs,
    "cl: " + state.cl,
    "af: " + Math.round((180 * state.af) / (2 * Math.PI)) + "°",
    "ar: " + Math.round((180 * state.ar) / (2 * Math.PI)) + "°",
    "fu: " + state.fu,
    "cfu: " + state.cfu,
    "ru: " + state.ru,
    "cru: " + state.cru,
    "clf: " + state.clf,
    "clr: " + state.clr,
  ]);
  ctx.restore();
}

function draw() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.save();
  ctx.font = "5px serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.lineWidth = 0.3;

  ctx.translate(cameraOffset.x, cameraOffset.y);
  ctx.scale(cameraZoom, cameraZoom);

  if (debug) {
    printState(state);
  }

  state.daf = (2.0 * Math.PI) / state.f; // angle between two cogs
  state.rf = halfLink / 2 / Math.sin(state.daf / 2.0); // radius to rivet - drawing1.jpg

  state.dar = (2.0 * Math.PI) / state.r; // angle between two cogs
  state.rr = halfLink / 2 / Math.sin(state.dar / 2.0); // radius to rivet - drawing1.jpg

  drawCogs(state);
  drawRivets(state);

  ctx.restore();

  requestAnimationFrame(draw);
}
