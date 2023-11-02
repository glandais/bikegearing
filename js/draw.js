function printStateValues(values) {
  for (let i = 0; i < values.length; i++) {
    ctx.fillText(values[i], 10, 20 + 16 * i);
  }
}

function commonPrintState(state) {
  let wear = roundHuman((100.0 * halfLinkChain) / HALF_LINK - 100.0, 1);
  return [
    "Chain wear: " + wear + "%",
    "Speed: " + roundHuman(speed * 100, 0) + "%",
    "Chainring cogs: " + state.f,
    "Sprocket cogs: " + state.r,
    "Single-legged skid patches: " + state.skidPatchesSingleLegged,
    "Ambidextrous skid patches: " + state.skidPatchesAmbidextrous,
    "Chainstay: " + roundHuman(state.cs, 2) + "mm",
    "Chain links: " + state.cl,
    "Speed (km/h): " + roundHuman(state.speedkmh, 1),
    "RPM: " + roundHuman(state.rpm, 1),
    "",
    "FPS: " + roundHuman(state.fps, 0),
  ];
}

function printState(state) {
  ctx.save();
  ctx.font = "16px serif";
  let values = commonPrintState(state);
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
  printStateValues(values);
  ctx.restore();
}

function printHumanState(state) {
  ctx.save();
  ctx.font = "16px serif";
  printStateValues(commonPrintState(state));
  ctx.restore();
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
    printState(state);
  } else {
    printHumanState(state);
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
