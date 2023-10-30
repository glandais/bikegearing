function drawRawRivet() {
  const dist = halfLink;
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

  const d = dist(p1, p2);

  ctx.save();
  ctx.translate(p1.x, p1.y);
  const a = getAngle(p1, p2);
  ctx.rotate(a);
  if (debug) {
    ctx.lineWidth = 0.1;
    ctx.fillStyle = "#000";
    ctx.fillText(rn + "", 0, 5);
    ctx.beginPath();
    ctx.arc(0, 0, 3.7, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    let dy = 0;
    if (rivet.rn % 2 == 1) {
      dy = 1;
    } else {
      dy = -1;
    }
    ctx.moveTo((d - halfLink) / 2, dy);
    ctx.lineTo((d - halfLink) / 2, 0);
    ctx.lineTo(d - (d - halfLink) / 2, 0);
    ctx.lineTo(d - (d - halfLink) / 2, dy);
    ctx.stroke();
    ctx.closePath();
  } else {
    ctx.translate((d - halfLink) / 2, 0);
    ctx.fillStyle = "#ddd";

    ctx.beginPath();
    drawRawRivet();
    ctx.fill();
    drawRawRivet();
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
      ctx.arc(d, 0, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.arc(d, 0, 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }
    if (rivet.rn % 10 == 1) {
      ctx.save();
      ctx.font = "3.5px serif";
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "#000";
      ctx.strokeText("GLA", d / 2, 0.4);
      ctx.restore();
    }
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

function getRivetsFront(state, rivets) {
  for (let i = 1; i < state.fr; i++) {
    const cog = i + (state.fcu - state.fr);
    const p1 = getRivetPoint(
      state.cs,
      state.fradius,
      state.fa - cog * state.daf
    );
    const p2 = getRivetPoint(
      state.cs,
      state.fradius,
      state.fa - (cog + 1) * state.daf
    );

    const rn = getRn(state.fru + cog - state.fcu, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function getRivetsRear(state, rivets) {
  for (let i = 0; i < state.rr - 1; i++) {
    const cog = i + state.rcu;
    const p1 = getRivetPoint(0, state.rradius, state.ra - cog * state.dar);
    const p2 = getRivetPoint(
      0,
      state.rradius,
      state.ra - (cog + 1) * state.dar
    );
    const rn = getRn(state.rru + i, state.cl);
    rivets.push({ p1, p2, rn });
  }
}

function getRivetsUp(state, rivets) {
  let rs = state.fru;
  let re = state.rru - 1;
  while (re < rs) {
    re = re + state.cl;
  }
  const s = getRivetPoint(
    state.cs,
    state.fradius,
    state.fa - state.fcu * state.daf
  );
  const e = getRivetPoint(0, state.rradius, state.ra - state.rcu * state.dar);

  let d = state.rru - state.fru;
  while (d < 0) {
    d = d + state.cl;
  }
  for (let i = 0; i < d; i++) {
    let rn = getRn(state.fru + i, state.cl);
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

function getRivetsDown(state, rivets) {
  let rs = state.rru + state.rr - 1;
  let re = state.fru - state.fr;
  while (re < rs) {
    re = re + state.cl;
  }
  const s = getRivetPoint(
    0,
    state.rradius,
    state.ra - (state.rcu + state.rr - 1) * state.dar
  );
  const e = getRivetPoint(
    state.cs,
    state.fradius,
    state.fa - (state.fcu - state.fr + 1) * state.daf
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

function getRivets(state) {
  let rivets = [];
  getRivetsFront(state, rivets);
  getRivetsRear(state, rivets);
  getRivetsUp(state, rivets);
  getRivetsDown(state, rivets);
  return rivets;
}

function drawRivets(state) {
  const rivets = getRivets(state);
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
