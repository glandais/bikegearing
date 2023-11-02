function getRivetIndex(state, i) {
  while (i < 0) {
    i = i + state.cl;
  }
  return i % state.cl;
}

function getCogIndex(c, i) {
  while (i < 0) {
    i = i + c;
  }
  return i % c;
}

function getRivet(state, rivets, i) {
  return rivets[getRivetIndex(state, i)];
}

function getFrontCogPoint(state, c) {
  let a = state.fa - c * state.fda;
  return {
    x: state.cs + state.fradius * Math.cos(a),
    y: state.fradius * Math.sin(a),
  };
}

function getRearCogPoint(state, c) {
  let a = state.ra - c * state.rda;
  return {
    x: state.rradius * Math.cos(a),
    y: state.rradius * Math.sin(a),
  };
}

function getRivetsUp(state, rivets) {
  let s = getFrontCogPoint(state, state.fcu);
  let e = getRearCogPoint(state, state.rcu);
  let rc = getRivetIndex(state, state.rru - state.fru);
  let points = catenary(s, e, rc * HALF_LINK, rc);
  for (let i = 0; i < points.length; i++) {
    rivets.push(points[i]);
  }
}

function getRivetsRear(state, rivets) {
  let count = getRivetIndex(state, state.rrb - state.rru);
  for (let i = 1; i < count; i++) {
    let c = state.rcu + i;
    let p = getRearCogPoint(state, c);
    rivets.push(p);
  }
}

function getRivetsDown(state, rivets) {
  let s = getRearCogPoint(state, state.rcb);
  let e = getFrontCogPoint(state, state.fcb);
  let rc = getRivetIndex(state, state.frb - state.rrb);
  let points = catenary(s, e, rc * HALF_LINK, rc);
  for (let i = 0; i < points.length; i++) {
    rivets.push(points[i]);
  }
}

function getRivetsFront(state, rivets) {
  let count = getRivetIndex(state, state.fru - state.frb);
  for (let i = 1; i < count; i++) {
    let c = state.fcb + i;
    let p = getFrontCogPoint(state, c);
    rivets.push(p);
  }
}

function getRivets(state) {
  let rivets = [];
  getRivetsUp(state, rivets);
  getRivetsRear(state, rivets);
  getRivetsDown(state, rivets);
  getRivetsFront(state, rivets);
  let result = [];
  for (let i = 0; i < state.cl; i++) {
    result.push(rivets[getRivetIndex(state, i - state.fru)]);
  }
  return result;
}
