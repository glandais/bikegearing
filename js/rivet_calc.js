function getRn(rn, c) {
  while (rn < 0) {
    rn = rn + c;
  }
  return rn % c;
}

function getRivet(state, rivets, rn) {
  rn = getRn(rn, state.cl);
  for (let i = 0; i < rivets.length; i++) {
    if (rivets[i].rn === rn) {
      return rivets[i];
    }
  }
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

  let points = catenary(s, e, d * HALF_LINK, d);
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

  let points = catenary(s, e, d * HALF_LINK, d);
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
