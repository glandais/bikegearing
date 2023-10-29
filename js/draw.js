let canvas;
let ctx;

function getArcEnd(r, a) {
  return {
    x: r * Math.cos(a),
    y: r * Math.sin(a),
  };
}

function drawCog(cog) {
  // https://www.geogebra.org/geometry/xdgnvmz3
  // rear_tooth_2.png
  ctx.save();

  ctx.rotate(cog.a);

  const c1 = getArcEnd(r + 2, cog.da / 2);
  const c2 = getArcEnd(r + 2, -cog.da / 2);
  const a = cog.da / 2;
  const aup = (70 * Math.PI) / 180;

  if (debug) {
    ctx.fillText("" + cog.i, cog.r + 10, 0);
  }

  ctx.beginPath();
  ctx.arc(c1.x, c1.y, 1.7, a, a - aup, true);
  ctx.arc(cog.r, 0, 3.7, (2 * Math.PI) / 3, (-2 * Math.PI) / 3);
  ctx.arc(c2.x, c2.y, 1.7, aup - a, -a, true);
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function drawCogs(cogs) {
  da = (2.0 * Math.PI) / cogs.c; // angle between two cogs
  r = halfLink / 2 / Math.sin(da / 2.0); // radius to rivet - drawing1.jpg
  for (let i = 0; i < cogs.c; i++) {
    drawCog({ r: r, i: i, a: cogs.a - i * da, da: da });
  }
}

function getAngle(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let a = 0;
  if (Math.abs(dx) < 0.0001) {
    if (dy > 0) {
      a = Math.PI / 2;
    } else {
      a = -Math.PI / 2;
    }
  } else {
    a = Math.atan(dy / dx);
    if (dx < 0) {
      a = a + Math.PI;
    }
  }
  return a;
}

function drawRawRivet(dist) {
  let r = 5;
  let dcx1 = dist / 8;
  let dcx2 = dist / 4;
  let dy = 1;
  ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.bezierCurveTo(dcx1, -r, dist / 2 - dcx2, -r + dy, dist / 2, -r + dy);
  ctx.bezierCurveTo(dist / 2 + dcx2, -r + dy, dist - dcx1, -r, dist, -r);
  ctx.arc(dist, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.bezierCurveTo(dist - dcx1, r, dist / 2 + dcx2, r - dy, dist / 2, r - dy);
  ctx.bezierCurveTo(dist / 2 - dcx2, r - dy, dcx1, r, 0, r);
}

function drawRivet(rivet) {
  const p1 = rivet.p1;
  const p2 = rivet.p2;
  const rn = rivet.rn;

  const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  ctx.save();
  ctx.fillStyle = "#ddd";
  ctx.translate(p1.x, p1.y);
  const a = getAngle(p1, p2);
  ctx.rotate(a);

  ctx.beginPath();
  drawRawRivet(dist);
  ctx.fill();
  drawRawRivet(dist);
  ctx.stroke();
  ctx.closePath();

  if (rivet.rn % 2 == 1) {
    ctx.fillStyle = "#ccc";
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(dist, 0, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.arc(dist, 0, 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
  if (rivet.rn % 10 == 1) {
    ctx.font = "3.5px serif";
    ctx.strokeStyle = "#000";
    ctx.strokeText("GLA", dist / 2, 0.4);
  }

  if (debug) {
    ctx.fillStyle = "#000";
    ctx.fillText(rn + "", dist / 2, 0);
  }
  ctx.restore();
}

function getRn(rn, c) {
  while (rn < 0) {
    rn = rn + c;
  }
  return rn % c;
}

function getRivetPoint(dx, r, a) {
  return {
    x: dx + r * Math.cos(a),
    y: r * Math.sin(a),
  };
}

function drawRivetsFront(state, rivets) {
  da = (2.0 * Math.PI) / state.f; // angle between two cogs
  r = halfLink / 2 / Math.sin(da / 2.0); // radius to rivet - drawing1.jpg
  for (let i = state.fu - state.clf; i < state.fu; i++) {
    const p1 = getRivetPoint(state.cs, r, state.af - i * da);
    const p2 = getRivetPoint(state.cs, r, state.af - (i + 1) * da);
    // rn = i + drn
    // cru = ru + drn -> drn = cru - ru
    // rn = i + cru - ru
    const rn = getRn(i + state.cru - state.ru, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsRear(state, rivets) {
  da = (2.0 * Math.PI) / state.r; // angle between two cogs
  r = halfLink / 2 / Math.sin(da / 2.0); // radius to rivet - drawing1.jpg
  for (let i = state.ru; i < state.ru + state.clr; i++) {
    const p1 = getRivetPoint(0, r, state.ar - i * da);
    const p2 = getRivetPoint(0, r, state.ar - (i + 1) * da);
    // rn = i + drn
    // cfu = fu + drn -> drn = cfu - fu
    // rn = i + cfu - fu
    const rn = getRn(i + state.cru - state.fu, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsUp(state, rivets) {
  let rs = state.fu;
  let re = state.ru;
  while (re < rs) {
    re = rs + state.cl;
  }

}

function drawRivetsDown(state, rivets) {}

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

  ctx.save();
  ctx.translate(state.cs, 0);
  drawCogs({
    c: state.f,
    a: state.af,
  });
  ctx.restore();
  drawCogs({
    c: state.r,
    a: state.ar,
  });

  let rivets = [];
  drawRivetsFront(state, rivets);
  drawRivetsRear(state, rivets);
  drawRivetsUp(state, rivets);
  drawRivetsDown(state, rivets);
  rivets.forEach((rivet) => {
    if (rivet.rn % 2 == 0) {
      drawRivet(rivet);
    }
  });
  rivets.forEach((rivet) => {
    if (rivet.rn % 2 == 1) {
      drawRivet(rivet);
    }
  });

  ctx.restore();

  requestAnimationFrame(draw);
}
