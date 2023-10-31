function printStateValues(values) {
  for (let i = 0; i < values.length; i++) {
    ctx.fillText(values[i], 10, 20 + 16 * i);
  }
}

function commonPrintState(state) {
  let wear = roundHuman((100.0 * halfLinkChain / halfLink) - 100.0, 1);
  return [
    "Chain wear: " + wear + "%",
    "Speed: " + roundHuman(speed * 100, 0) + "%",
    "Chainring cogs: " + state.f,
    "Sprocket cogs: " + state.r,
    "Chainstay: " + roundHuman(state.cs, 2) + "mm",
    "Chain links: " + state.cl,
    "Speed (km/h): " + roundHuman(state.speedkmh, 1),
    "RPM: " + roundHuman(state.rpm, 1),
    "",
    "FPS: " + roundHuman(state.fps, 0)
  ];
}

function printState(state) {
  ctx.save();
  ctx.font = "16px serif";
  let wear = roundHuman((100.0 * halfLinkChain / halfLink) - 100.0, 1);
  let values = commonPrintState(state);
  let debugValues = [
    "",
    "t: " + state.t,
    "fa: " + Math.round((180 * state.fa) / TWO_PI) + "°",
    "fcu: " + state.fcu,
    "fru: " + state.fru,
    "fr: " + state.fr,
    "ra: " + Math.round((180 * state.ra) / TWO_PI) + "°",
    "rcu: " + state.rcu,
    "rru: " + state.rru,
    "rr: " + state.rr,
    "computeLog: " + state.computeLog,
    "Last draw: " + roundHuman(state.drawDuration, 2) + "ms"
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

function getRivet(rivets, rn) {
  for (let i = 0; i < rivets.length; i++) {
    if (rivets[i].rn === rn) {
      return rivets[i];
    }
  }
}

function draw() {
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
  let rivet;
  if (followRivet) {
    rivet = getRivet(rivets, 0);
    if (rivet) {
      let rivetAngle = getAngle(rivet.p1, rivet.p2);
      ctx.rotate(Math.PI - rivetAngle);
      ctx.translate(-rivet.p1.x, -rivet.p1.y);
    }
  }

  drawCogs(state);
  drawRivets(rivets);

  if (followRivet) {
    if (rivet) {
      ctx.beginPath();
      ctx.lineTo(rivet.p1.x - 5, rivet.p1.y);
      ctx.lineTo(rivet.p1.x + 5, rivet.p1.y);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.lineTo(rivet.p1.x, rivet.p1.y + 5);
      ctx.lineTo(rivet.p1.x, rivet.p1.y - 5);
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
  if (fill) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
  ctx.closePath();
}
