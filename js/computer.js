import { TWO_PI, HALF_LINK } from "./constants.js";
import {
  toDegreesHuman,
  comparableAngle,
  roundHuman,
  BikeGearingPoint,
  BikeGearingCircle,
} from "./math.js";

class BikeGearingComputer {
  constructor(state, rivetsCalculator) {
    this.state = state;
    this.rivetsCalculator = rivetsCalculator;
    this.rivets = [];

    this.onceModified = false;
    this.modified = false;
    this.broken = false;
    this.iterations = 0;
  }

  reset() {
    let state = this.state;
    let alpha = Math.asin((state.f - state.r) / state.cs);
    state.fa = -Math.PI / 2;
    state.fcu = 0;
    state.fru = 0;
    let fdr = Math.round(state.f / 2.0);
    state.fcb = state.fcu - fdr;
    state.frb = state.fru - fdr;

    state.ra = -Math.PI / 2;
    let rdr = Math.round(state.r / 2.0);
    state.rcu = 0;
    state.rcb = state.rcu + rdr;
    let rdiff = Math.round((state.cs * Math.cos(alpha)) / HALF_LINK) + 2;
    if (state.rotationSpeed > 0) {
      state.rru = rdiff;
      state.rrb = state.rru + rdr;
    } else {
      state.rrb = state.frb - rdiff;
      state.rru = state.rrb - rdr;
    }

    /*
    state.cl =
      1 +
      Math.ceil(
        (2 * (state.cs * Math.cos(alpha))) / HALF_LINK +
          state.f / 2.0 +
          state.r / 2.0
      );
      */

    this.moduloState();
  }

  debugAngles(label, mina, ra, maxa) {
    if (this.state.debugCompute) {
      console.log(
        "fixed :" +
          label +
          " - " +
          " mina: " +
          toDegreesHuman(mina) +
          " ra: " +
          toDegreesHuman(ra) +
          " maxa: " +
          toDegreesHuman(maxa),
      );
    }
  }

  moduloState() {
    let state = this.state;
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

  setBroken() {
    this.broken = true;
    this.reset();
    this.setModified();
  }

  setModified() {
    this.rivets = this.rivetsCalculator.getRivets();
    this.modified = true;
    this.onceModified = true;
  }

  checkState() {
    let state = this.state;
    let fdr = this.state.getRivetIndex(state.fru - state.frb);
    let fdc = this.rivetsCalculator.getCogIndex(state.f, state.fcu - state.fcb);
    let rdr = this.state.getRivetIndex(state.rrb - state.rru);
    let rdc = this.rivetsCalculator.getCogIndex(state.r, state.rcb - state.rcu);
    if (fdr != fdc || rdr != rdc) {
      console.error(["invalid state", state]);
      this.setBroken();
    }
  }

  chainTensionUp() {
    let state = this.state;
    let rivets = this.rivets;
    let r1 = this.rivetsCalculator.getRivet(rivets, state.fru);
    let r2 = this.rivetsCalculator.getRivet(rivets, state.rru);
    let d = r1.dist(r2);
    let maxDist =
      state.halfLinkChain * this.state.getRivetIndex(state.rru - state.fru);
    if (d >= maxDist) {
      let inter = new BikeGearingCircle(r1.x, r1.y, maxDist).intersection(
        new BikeGearingCircle(0, 0, state.rradius),
      );
      if (inter.intersectOccurs) {
        let pinter;
        if (inter.p1.y < 0) {
          pinter = inter.p1;
        } else {
          pinter = inter.p2;
        }
        let currentRa = state.ra - state.rcu * state.rda;
        let newRa = comparableAngle(
          currentRa,
          BikeGearingPoint.ZERO.getAngle(pinter),
        );
        if (Math.abs(newRa - currentRa) > 0.00001) {
          this.logCompute(["fixed chain tension, da : ", newRa - currentRa]);
          state.ra = state.ra + (newRa - currentRa);
          this.setModified();
        }
      } else {
        // broken, no intersection
        this.logCompute(["impossible to make chain tension", state]);
        this.setBroken();
      }
    }
  }

  chainTensionDown() {
    let state = this.state;
    let rivets = this.rivets;
    let r1 = this.rivetsCalculator.getRivet(rivets, state.frb);
    let r2 = this.rivetsCalculator.getRivet(rivets, state.rrb);
    let d = r1.dist(r2);
    let maxDist =
      state.halfLinkChain * this.state.getRivetIndex(state.frb - state.rrb);
    if (d >= maxDist) {
      let inter = new BikeGearingCircle(r1.x, r1.y, maxDist).intersection(
        new BikeGearingCircle(0, 0, state.rradius),
      );
      if (inter.intersectOccurs) {
        let pinter;
        if (inter.p1.y > 0) {
          pinter = inter.p1;
        } else {
          pinter = inter.p2;
        }
        let currentRa = state.ra - state.rcb * state.rda;
        let newRa = comparableAngle(
          currentRa,
          BikeGearingPoint.ZERO.getAngle(pinter),
        );
        if (Math.abs(newRa - currentRa) > 0.00001) {
          this.logCompute(["fixed chain tension, da : ", newRa - currentRa]);
          state.ra = state.ra + (newRa - currentRa);
          this.setModified();
        }
      } else {
        // broken, no intersection
        this.logCompute(["impossible to make chain tension", state]);
        this.setBroken();
      }
    }
  }

  fixRivet(label, ir1, ir2, front, c, f1, f2) {
    let rivets = this.rivets;
    let r1 = this.rivetsCalculator.getRivet(rivets, ir1);
    let r2 = this.rivetsCalculator.getRivet(rivets, ir2);
    let pm1, p, pp1;
    if (front) {
      pm1 = this.rivetsCalculator.getFrontCogPoint(c - 1);
      p = this.rivetsCalculator.getFrontCogPoint(c);
      pp1 = this.rivetsCalculator.getFrontCogPoint(c + 1);
    } else {
      pm1 = this.rivetsCalculator.getRearCogPoint(c - 1);
      p = this.rivetsCalculator.getRearCogPoint(c);
      pp1 = this.rivetsCalculator.getRearCogPoint(c + 1);
    }

    let ra = r1.getAngle(r2);
    let cam1 = comparableAngle(ra, pm1.getAngle(p));
    let cap1 = comparableAngle(ra, p.getAngle(pp1));
    let mina = Math.min(cap1, cam1);
    let maxa = Math.max(cap1, cam1);

    if (ra < mina - 0.001) {
      this.debugAngles(label + " ra < mina", mina, ra, maxa);
      f1();
      this.setModified();
    } else if (ra > maxa + 0.001) {
      this.debugAngles(label + " ra > maxa", mina, ra, maxa);
      f2();
      this.setModified();
    }
  }

  logCompute(s) {
    if (this.state.debugCompute) {
      console.log(s);
    }
  }

  computeLoop() {
    let state = this.state;
    let stepIterations = 0;
    let overflow = false;
    this.rivets = this.rivetsCalculator.getRivets();
    do {
      this.iterations++;
      stepIterations++;
      this.modified = false;
      if (stepIterations == 50) {
        console.log("overflow");
        overflow = true;
      }
      this.checkState();
      if (state.rotationSpeed > 0) {
        this.chainTensionUp();
      } else {
        this.chainTensionDown();
      }
      this.fixRivet(
        "front up",
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
        },
      );
      this.fixRivet(
        "front bottom",
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
        },
      );
      this.fixRivet(
        "rear bottom",
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
        },
      );
      this.fixRivet(
        "rear up",
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
        },
      );
    } while (this.modified && !overflow);
  }

  compute(dtchrono) {
    let state = this.state;
    let start = performance.now();

    this.logCompute("start compute");

    let dt = state.simulationSpeed * (dtchrono / 1000);
    state.t += dt;

    let rpa = state.ra;

    let fda = dt * ((state.rotationSpeed * TWO_PI) / 60.0);
    let fra = state.fa + fda;

    this.onceModified = false;
    this.modified = false;
    this.broken = false;
    this.iterations = 0;

    let forced = false;
    if (dtchrono == 0) {
      forced = true;
    }
    while (!this.broken && (Math.abs(state.fa - fra) > 0.00000001 || forced)) {
      if (fda > 0) {
        state.fa = state.fa + 0.01;
        if (state.fa > fra) {
          state.fa = fra;
        }
      } else {
        state.fa = state.fa - 0.01;
        if (state.fa < fra) {
          state.fa = fra;
        }
      }
      this.computeLoop();
      forced = false;
    }
    this.moduloState();

    let rda = comparableAngle(0, state.ra - rpa);

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
      this.onceModified +
      " " +
      this.iterations +
      " " +
      roundHuman(computeDuration, 1) +
      "ms";
    this.logCompute("end compute");
  }
}

export default BikeGearingComputer;
