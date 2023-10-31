function drawRawRivet() {
  let dist = halfLink;
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
  let p1 = rivet.p1;
  let p2 = rivet.p2;
  let rn = rivet.rn;

  let d = dist(p1, p2);

  ctx.save();
  ctx.translate(p1.x, p1.y);
  let a = getAngle(p1, p2);
  ctx.rotate(a);

  let stretch = 0;
  if (d < halfLink) {
    stretch = (d - halfLink) / d;
  } else if (d > halfLinkChain) {
    stretch = (d - halfLinkChain) / d;
  }

  if (debug) {
    ctx.lineWidth = 0.1;
    ctx.fillStyle = "#000";
    let perc = Math.round(stretch * 1000);
    ctx.fillText(rn + " " + perc, 0, 5);
    drawCircle(0, 0, 3.7);

    ctx.save();
    if (stretch > 0.0001) {
      stretch = Math.max(0.025, stretch);
    }
    if (stretch < -0.0001) {
      stretch = Math.min(-0.025, stretch);
    }
    let h = 120 - Math.max(-120, Math.min(120, Math.round(120 * stretch / 0.05)));
    ctx.strokeStyle = "hsla(" + h + ", 100%, 50%, 1)";

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

    ctx.restore();
  }

  ctx.translate((d - halfLink) / 2, 0);

  let astretch = Math.abs(stretch);
  if (astretch > 0.0001) {
    let s = Math.max(50, Math.min(100, Math.round(100 * stretch / 0.05)));
    ctx.fillStyle = "hsla(0, " + s + "%, 87%, 1)";
  } else {
    ctx.fillStyle = "hsla(0, 0%, 87%, 1)";
  }

  ctx.beginPath();
  drawRawRivet();
  if (!debug) {
    ctx.fill();
  }
  ctx.stroke();
  ctx.closePath();

  if (!debug && rivet.rn % 2 == 1) {
    ctx.fillStyle = "#ccc";
    drawCircle(0, 0, 2, true);
    drawCircle(d, 0, 2, true);
  }
  if (rivet.rn % 10 == 1) {
    ctx.save();
    ctx.font = "3.5px serif";
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "#000";
    ctx.strokeText("GLA", d / 2, 0.4);
    ctx.restore();
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
    let cog = i + (state.fcu - state.fr);
    let p1 = getRivetPoint(
      state.cs,
      state.fradius,
      state.fa - cog * state.fda
    );
    let p2 = getRivetPoint(
      state.cs,
      state.fradius,
      state.fa - (cog + 1) * state.fda
    );

    let rn = getRn(state.fru + cog - state.fcu, state.cl);
    rivets.push({ p1, p2, rn, p1fixed: true, p2fixed: true });
  }
}

function getRivetsRear(state, rivets) {
  for (let i = 0; i < state.rr - 1; i++) {
    let cog = i + state.rcu;
    let p1 = getRivetPoint(0, state.rradius, state.ra - cog * state.rda);
    let p2 = getRivetPoint(
      0,
      state.rradius,
      state.ra - (cog + 1) * state.rda
    );
    let rn = getRn(state.rru + i, state.cl);
    rivets.push({ p1, p2, rn, p1fixed: true, p2fixed: true });
  }
}

function getRivetsUp(state, rivets) {
  let s = getRivetPoint(
    state.cs,
    state.fradius,
    state.fa - state.fcu * state.fda
  );
  let e = getRivetPoint(0, state.rradius, state.ra - state.rcu * state.rda);

  let d = state.rru - state.fru;
  while (d < 0) {
    d = d + state.cl;
  }

  let points = catenary(s, e, d * halfLink, d);
  for (let i = 0; i < points.length - 1; i++) {
    let rn = getRn(state.fru + i, state.cl);
    rivets.push({ p1: points[i], p2: points[i + 1], rn });
  }

}

function getRivetsDown(state, rivets) {
  let rs = state.rru + state.rr - 1;
  let re = state.fru - state.fr;
  while (re < rs) {
    re = re + state.cl;
  }
  let s = getRivetPoint(
    0,
    state.rradius,
    state.ra - (state.rcu + state.rr - 1) * state.rda
  );
  let e = getRivetPoint(
    state.cs,
    state.fradius,
    state.fa - (state.fcu - state.fr + 1) * state.fda
  );

  let d = 1 + re - rs;

  let points = catenary(s, e, d * halfLink, d);
  for (let i = 0; i < points.length - 1; i++) {
    let rn = getRn(i + rs, state.cl);
    rivets.push({ p1: points[i], p2: points[i + 1], rn });
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

function drawRivets(rivets) {
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
