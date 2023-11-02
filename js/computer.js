function resetComputer(state) {
  let alpha = Math.asin((state.f - state.r) / state.cs);
  state.fa = -Math.PI / 2;
  state.fcu = 0;
  state.fru = 0;
  let fdr = Math.round(state.f / 2.0);
  state.fcb = state.fcu - fdr;
  state.frb = state.fru - fdr;

  state.ra = -Math.PI / 2;
  state.rcu = 0;
  state.rru = Math.round((state.cs * Math.cos(alpha)) / HALF_LINK);
  let rdr = Math.round(state.r / 2.0);
  state.rcb = state.rcu + rdr;
  state.rrb = state.rru + rdr;

  /*
  state.cl =
    1 +
    Math.ceil(
      (2 * (state.cs * Math.cos(alpha))) / HALF_LINK +
        state.f / 2.0 +
        state.r / 2.0
    );
    */

  moduloState(state);
}

function debugAngles(label, mina, ra, maxa) {
  if (debugCompute) {
    console.log(
      "fixed :" +
        label +
        " - " +
        " mina: " +
        roundHuman(toDegrees(mina), 1) +
        " ra: " +
        roundHuman(toDegrees(ra), 1) +
        " maxa: " +
        roundHuman(toDegrees(maxa), 1)
    );
  }
}

function moduloState(state) {
  state.fa = comparableAngle(0, state.fa);
  state.fcu = (state.fcu + state.f) % state.f;
  state.fru = (state.fru + state.cl) % state.cl;
  state.fcb = (state.fcb + state.f) % state.f;
  state.frb = (state.frb + state.cl) % state.cl;

  state.ra = comparableAngle(0, state.ra);
  state.rcu = (state.rcu + state.r) % state.r;
  state.rru = (state.rru + state.cl) % state.cl;
  state.rcb = (state.rcb + state.r) % state.r;
  state.rrb = (state.rrb + state.cl) % state.cl;
}

function checkState(state) {
  let fdr = getRivetIndex(state, state.fru - state.frb);
  let fdc = getCogIndex(state.f, state.fcu - state.fcb);
  let rdr = getRivetIndex(state, state.rrb - state.rru);
  let rdc = getCogIndex(state.r, state.rcb - state.rcu);
  if (fdr != fdc || rdr != rdc) {
    logCompute(["invalid state", state]);
    resetComputer(state);
    return true;
  }
  return false;
}

function chainTension(state, rivets) {
  let r1 = getRivet(state, rivets, state.fru);
  let r2 = getRivet(state, rivets, state.rru);
  let d = dist(r1, r2);
  let maxDist = halfLinkChain * getRivetIndex(state, state.rru - state.fru);
  if (d >= maxDist) {
    let inter = intersection(
      {
        x: r1.x,
        y: r1.y,
        r: maxDist,
      },
      {
        x: 0,
        y: 0,
        r: state.rradius,
      }
    );
    if (inter.intersect_occurs) {
      let pinter;
      if (inter.point_1.y < 0) {
        pinter = inter.point_1;
      } else {
        pinter = inter.point_2;
      }
      let currentRa = state.ra - state.rcu * state.rda;
      let newRa = comparableAngle(currentRa, getAngle({ x: 0, y: 0 }, pinter));
      if (Math.abs(newRa - currentRa) > 0.00001) {
        logCompute(["fixed chain tension, da : ", newRa - currentRa]);
        state.ra = state.ra + (newRa - currentRa);
        return true;
      }
      return false;
    } else {
      // reset cog, no intersection
      logCompute(["impossible to make chain tension", state]);
      let alpha = Math.asin((state.f - state.r) / state.cs);
      state.ra = -Math.PI / 2;
      state.rcu = -1;
      state.rru =
        state.fru + Math.round((state.cs * Math.cos(alpha)) / HALF_LINK);
      let rdr = Math.round(state.r / 2.0) + 2;
      state.rcb = state.rcu + rdr;
      state.rrb = state.rru + rdr;
      return true;
    }
  }
}

function fixRivet(label, state, rivets, ir1, ir2, front, c, f1, f2) {
  let r1 = getRivet(state, rivets, ir1);
  let r2 = getRivet(state, rivets, ir2);
  let getCogPoint;
  if (front) {
    getCogPoint = getFrontCogPoint;
  } else {
    getCogPoint = getRearCogPoint;
  }
  let pm1 = getCogPoint(state, c - 1);
  let p = getCogPoint(state, c);
  let pp1 = getCogPoint(state, c + 1);

  let ra = getAngle(r1, r2);
  let cam1 = comparableAngle(ra, getAngle(pm1, p));
  let cap1 = comparableAngle(ra, getAngle(p, pp1));
  let mina = Math.min(cap1, cam1);
  let maxa = Math.max(cap1, cam1);

  if (ra < mina - 0.001) {
    debugAngles(label + " ra < mina", mina, ra, maxa);
    f1();
    return true;
  } else if (ra > maxa + 0.001) {
    debugAngles(label + " ra > maxa", mina, ra, maxa);
    f2();
    return true;
  }
  return false;
}

function logCompute(s) {
  if (debugCompute) {
    console.log(s);
  }
}

function compute(state, dtchrono) {
  let start = performance.now();

  logCompute("start compute");

  let dt = speed * (dtchrono / 1000);
  state.t += dt;
  let onceModified = false;

  let rpra = state.ra;
  let fpra = state.fa;

  let fra = state.fa + dt * 10;
  let iterations = 0;
  let forced = false;
  if (dtchrono == 0) {
    forced = true;
  }
  while (state.fa < fra || forced) {
    state.fa = state.fa + 0.01;
    if (state.fa > fra) {
      state.fa = fra;
    }
    let modified = false;

    let stepIterations = 0;
    let overflow = false;

    let rivets = getRivets(state);
    do {
      iterations++;
      stepIterations++;
      modified = false;
      if (stepIterations == 50) {
        // chain is not stable ...
        /*
        console.log("resetComputer");
        resetComputer(state);
        fra = state.fa;
        rivets = getRivets(state);
        modified = true;
        */
      }
      if (stepIterations == 100) {
        console.log("overflow");
        overflow = true;
      }
      if (checkState(state)) {
        rivets = getRivets(state);
        modified = true;
      }
      if (chainTension(state, rivets)) {
        rivets = getRivets(state);
        modified = true;
      }
      if (
        fixRivet(
          "front up",
          state,
          rivets,
          state.fru,
          state.fru + 1,
          true,
          state.fcu,
          () => {
            state.fcu += 1;
            state.fru += 1;
          },
          () => {
            state.fcu -= 1;
            state.fru -= 1;
          }
        )
      ) {
        rivets = getRivets(state);
        modified = true;
      }
      if (
        fixRivet(
          "front bottom",
          state,
          rivets,
          state.frb - 1,
          state.frb,
          true,
          state.fcb,
          () => {
            state.fcb += 1;
            state.frb += 1;
          },
          () => {
            state.fcb -= 1;
            state.frb -= 1;
          }
        )
      ) {
        rivets = getRivets(state);
        modified = true;
      }
      if (
        fixRivet(
          "rear bottom",
          state,
          rivets,
          state.rrb,
          state.rrb + 1,
          false,
          state.rcb,
          () => {
            state.rcb += 1;
            state.rrb += 1;
          },
          () => {
            state.rcb -= 1;
            state.rrb -= 1;
          }
        )
      ) {
        rivets = getRivets(state);
        modified = true;
      }
      if (
        fixRivet(
          "rear up",
          state,
          rivets,
          state.rru - 1,
          state.rru,
          false,
          state.rcu,
          () => {
            state.rcu += 1;
            state.rru += 1;
          },
          () => {
            state.rcu -= 1;
            state.rru -= 1;
          }
        )
      ) {
        rivets = getRivets(state);
        modified = true;
      }
      if (modified) {
        onceModified = true;
      }
    } while (modified && !overflow);
    forced = false;
  }
  moduloState(state);

  let rda = state.ra - rpra;
  rda = comparableAngle(0, rda);
  let fda = state.fa - fpra;
  fda = comparableAngle(0, fda);

  let distchronokm = (2100 / (1000 * 1000)) * (rda / TWO_PI);
  let dtchronoh = dtchrono / (1000 * 3600);
  let speedkmh = distchronokm / dtchronoh;

  state.speedkmh = speedkmh;

  let rotation = fda / TWO_PI;
  let dtchronomin = dtchrono / (1000 * 60);
  let rpm = rotation / dtchronomin;

  state.rpm = rpm;

  let computeDuration = performance.now() - start;
  state.computeLog =
    onceModified +
    " " +
    iterations +
    " " +
    roundHuman(computeDuration, 1) +
    "ms";
  logCompute("end compute");
}
