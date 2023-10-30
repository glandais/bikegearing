function printStateValues(values) {
  for (let i = 0; i < values.length; i++) {
    ctx.fillText(values[i], 10, 20 + 16 * i);
  }
}

function printState(state) {
  ctx.save();
  ctx.font = "16px serif";
  printStateValues([
    "halfLinkChain: " + halfLinkChain,
    "dt: " + dt,
    "f: " + state.f,
    "r: " + state.r,
    "cs: " + state.cs,
    "cl: " + state.cl,
    "fa: " + Math.round((180 * state.fa) / (2 * Math.PI)) + "°",
    "fcu: " + state.fcu,
    "fru: " + state.fru,
    "fr: " + state.fr,
    "ra: " + Math.round((180 * state.ra) / (2 * Math.PI)) + "°",
    "rcu: " + state.rcu,
    "rru: " + state.rru,
    "rr: " + state.rr,
    "modified: " + state.modified,
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

  drawCogs(state);
  drawRivets(state);

  ctx.restore();

  if (debug) {
    printState(state);
  }

  requestAnimationFrame(draw);
}
