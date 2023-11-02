function printStateValues(values) {
  ctx.save();
  ctx.font = "16px serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  let maxWidth = 0;
  for (let i = 0; i < values.length; i++) {
    maxWidth = Math.max(maxWidth, ctx.measureText(values[i]).width);
  }
  ctx.fillRect(10, 4, maxWidth, 17 * values.length);
  ctx.fillStyle = "#000";
  for (let i = 0; i < values.length; i++) {
    ctx.fillText(values[i], 10, 20 + 17 * i);
  }
  ctx.restore();
}

function getCommonValues(state) {
  let wear = roundHuman((100.0 * halfLinkChain) / HALF_LINK - 100.0, 1);
  return [
    "Chain wear: " + wear + "%",
    "Simulation speed: " + roundHuman(simulationSpeed * 100, 0) + "%",
    "Rotation speed: " + roundHuman(rotationSpeed, 1) + "rpm",
    "Chainring cogs: " + state.f,
    "Sprocket cogs: " + state.r,
    "Single-legged skid patches: " + state.skidPatchesSingleLegged,
    "Ambidextrous skid patches: " + state.skidPatchesAmbidextrous,
    "Chainstay: " + roundHuman(state.cs, 2) + "mm",
    "Chain links: " + state.cl,
    "Speed (km/h): " + roundHuman(state.speedkmh, 1),
    "RPM: " + roundHuman(state.rpm, 1) + "rpm",
    "",
    "FPS: " + roundHuman(state.fps, 0),
  ];
}

function getDebugValues(state) {
  let values = getCommonValues(state);
  let debugValues = [
    "",
    "t: " + state.t,
    "fa: " + roundHuman(toDegrees(state.fa), 1) + "°",
    "fcu: " + state.fcu,
    "fru: " + state.fru,
    "fcb: " + state.fcb,
    "frb: " + state.frb,
    "ra: " + roundHuman(toDegrees(state.ra), 1) + "°",
    "rcu: " + state.rcu,
    "rru: " + state.rru,
    "rcb: " + state.rcb,
    "rrb: " + state.rrb,
    "computeLog: " + state.computeLog,
    "Last draw: " + roundHuman(state.drawDuration, 2) + "ms",
    "cameraOffset.x: " + roundHuman(cameraOffset.x, 2),
    "cameraOffset.y: " + roundHuman(cameraOffset.y, 2),
    "cameraZoom: " + roundHuman(cameraZoom, 2),
    "worldWidth: " + roundHuman(worldWidth, 2),
  ];
  values.push(...debugValues);
  return values;
}

function draw(state) {
  let start = performance.now();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (debug || paused) {
    ctx.fillStyle = "rgba(255,255,255,1.0)";
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.save();
  ctx.font = "5px serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.lineWidth = 0.3;

  ctx.translate(cameraOffset.x, cameraOffset.y);
  ctx.scale(cameraZoom, cameraZoom);

  let rivets = getRivets(state);
  let r1;
  if (followRivet) {
    r1 = getRivet(state, rivets, 0);
    r2 = getRivet(state, rivets, 1);
    if (r1 && r2) {
      let rivetAngle = getAngle(r1, r2);
      ctx.rotate(Math.PI - rivetAngle);
      ctx.translate(-r1.x, -r1.y);
    }
  }

  if (doDrawWheel) {
    drawWheel(state);
  }
  drawCogs(state);
  drawLinks(rivets);

  if (followRivet) {
    if (r1) {
      ctx.beginPath();
      ctx.lineTo(r1.x - 5, r1.y);
      ctx.lineTo(r1.x + 5, r1.y);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.lineTo(r1.x, r1.y + 5);
      ctx.lineTo(r1.x, r1.y - 5);
      ctx.stroke();
      ctx.closePath();
    }
  }

  ctx.restore();

  if (debug) {
    printStateValues(getDebugValues(state));
  } else {
    printStateValues(getCommonValues(state));
  }
  state.drawDuration = performance.now() - start;
}

function drawCircle(x, y, r, fill = false) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  if (fill && !debug) {
    ctx.fill();
  }
  ctx.stroke();
  ctx.closePath();
}

function drawIfPaused() {
  if (paused) {
    draw(state);
  }
}
