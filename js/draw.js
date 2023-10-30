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
    "d: " + state.t,
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

function roundHuman(v, d) {
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
}

function printHumanState(state) {
  ctx.save();
  ctx.font = "16px serif";
  const wear = roundHuman((100.0 * halfLinkChain / halfLink) - 100.0, 1);
  printStateValues([
    "Chain wear: " + wear + "%",
    "Interval: " + roundHuman(dt, 6),
    "Chainring cogs: " + state.f,
    "Sprocket cogs: " + state.r,
    "Chainstay: " + roundHuman(state.cs, 2) + "mm",
    "Chain links: " + state.cl
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
  } else {
    printHumanState(state);
  }

  requestAnimationFrame(draw);
}
