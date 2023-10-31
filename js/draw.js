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
    "speed: " + speed,
    "speed (km/h): " + state.speedkmh,
    "rpm: " + state.rpm,
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
    "Last compute: " + roundHuman(state.progressDuration, 2) + "ms",
    "Last draw: " + roundHuman(state.drawDuration, 2) + "ms"
  ]);
  ctx.restore();
}

function roundHuman(v, d) {
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
}

function printHumanState(state) {
  ctx.save();
  ctx.font = "16px serif";
  let wear = roundHuman((100.0 * halfLinkChain / halfLink) - 100.0, 1);
  printStateValues([
    "Chain wear: " + wear + "%",
    "Speed: " + roundHuman(speed * 100, 0) + "%",
    "Chainring cogs: " + state.f,
    "Sprocket cogs: " + state.r,
    "Chainstay: " + roundHuman(state.cs, 2) + "mm",
    "Chain links: " + state.cl,
    "Speed (km/h): " + roundHuman(state.speedkmh, 1),
    "RPM: " + roundHuman(state.rpm, 1),
  ]);
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
