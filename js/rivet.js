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
    ctx.fillText(rn + "", 0, 0);
    ctx.fillText(rn + 1 + "", dist, 0);
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
  for (let i = 1; i < state.clf; i++) {
    const cog = i + (state.fu - state.clf);
    const p1 = getRivetPoint(state.cs, state.rf, state.af - cog * state.daf);
    const p2 = getRivetPoint(
      state.cs,
      state.rf,
      state.af - (cog + 1) * state.daf
    );

    const rn = getRn(state.cfu + cog - state.fu, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsRear(state, rivets) {
  for (let i = 0; i < state.clr - 1; i++) {
    const cog = i + state.ru;
    const p1 = getRivetPoint(0, state.rr, state.ar - cog * state.dar);
    const p2 = getRivetPoint(0, state.rr, state.ar - (cog + 1) * state.dar);
    // rn = i + drn
    // cfu = fu + drn -> drn = cfu - fu
    // rn = i + cfu - fu
    const rn = getRn(state.cru + i, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsUp(state, rivets) {
  let rs = state.cfu;
  let re = state.cru - 1;
  while (re < rs) {
    re = re + state.cl;
  }
  const s = getRivetPoint(state.cs, state.rf, state.af - state.fu * state.daf);
  const e = getRivetPoint(0, state.rr, state.ar - state.ru * state.dar);

  for (let i = 0; i < state.cru - state.cfu; i++) {
    let rn = state.cfu + i;
    let p1 = {
      x: s.x + (i * (e.x - s.x)) / (1 + re - rs),
      y: s.y + (i * (e.y - s.y)) / (1 + re - rs),
    };
    let p2 = {
      x: s.x + ((i + 1) * (e.x - s.x)) / (1 + re - rs),
      y: s.y + ((i + 1) * (e.y - s.y)) / (1 + re - rs),
    };
    rivets.push({ p1, p2, rn });
  }
}

function drawRivetsDown(state, rivets) {
  let rs = state.cru + state.clr - 1;
  let re = state.cfu - state.clf;
  while (re < rs) {
    re = re + state.cl;
  }
  const s = getRivetPoint(
    0,
    state.rr,
    state.ar - (state.ru + state.clr - 1) * state.dar
  );
  const e = getRivetPoint(
    state.cs,
    state.rf,
    state.af - (state.fu - state.clf + 1) * state.daf
  );

  const d = 1 + re - rs;
  for (let i = rs; i < re + 1; i++) {
    const rn = getRn(i, state.cl);
    let p1 = {
      x: s.x + ((i - rs) * (e.x - s.x)) / d,
      y: s.y + ((i - rs) * (e.y - s.y)) / d,
    };
    let p2 = {
      x: s.x + ((i - rs + 1) * (e.x - s.x)) / d,
      y: s.y + ((i - rs + 1) * (e.y - s.y)) / d,
    };
    rivets.push({ p1, p2, rn });
  }
}

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
