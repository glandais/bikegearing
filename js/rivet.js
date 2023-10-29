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
  for (let i = state.fu - state.clf + 1; i < state.fu; i++) {
    const p1 = getRivetPoint(state.cs, state.rf, state.af - i * state.daf);
    const p2 = getRivetPoint(state.cs, state.rf, state.af - (i + 1) * state.daf);
    // rn = i + drn
    // cru = ru + drn -> drn = cru - ru
    // rn = i + cru - ru
    const rn = getRn(i + state.cru - state.ru, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsRear(state, rivets) {
  for (let i = state.ru; i < state.ru + state.clr - 1; i++) {
    const p1 = getRivetPoint(0, state.rr, state.ar - i * state.dar);
    const p2 = getRivetPoint(0, state.rr, state.ar - (i + 1) * state.dar);
    // rn = i + drn
    // cfu = fu + drn -> drn = cfu - fu
    // rn = i + cfu - fu
    const rn = getRn(i + state.cru - state.fu, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsUp(state, rivets) {
  let rs = state.cfu;
  let re = state.cru;
  while (re < rs) {
    re = re + state.cl;
  }
  //console.log(rs + " " + re)
}

function drawRivetsDown(state, rivets) {}

function drawRivets(state) {
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
}
