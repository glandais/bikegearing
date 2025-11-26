import { TWO_PI, HALF_LINK, PHYSICS_CONSTANTS } from "./constants.js";
import {
  toDegreesHuman,
  comparableAngle,
  roundHuman,
  BikeGearingPoint,
  BikeGearingCircle,
} from "./math.js";
import BikeGearingRivetsCalculator from "./rivet_calculator.js";
import BikeGearingState from "./state.js";

export default class BikeGearingComputer {
  state: BikeGearingState;
  rivetsCalculator: BikeGearingRivetsCalculator;
  rivets: BikeGearingPoint[] = [];

  onceModified: boolean = false;
  modified: boolean = false;
  broken: boolean = false;
  iterations: number = 0;

  constructor(
    state: BikeGearingState,
    rivetsCalculator: BikeGearingRivetsCalculator
  ) {
    this.state = state;
    this.rivetsCalculator = rivetsCalculator;
  }

  reset(): void {
    const state = this.state;
    const alpha = Math.asin((state.f - state.r) / state.cs);
    state.fa = -Math.PI / 2;
    state.fcu = 0;
    state.fru = 0;
    const fdr = Math.round(state.f / 2.0);
    state.fcb = state.fcu - fdr;
    state.frb = state.fru - fdr;

    state.ra = -Math.PI / 2;
    const rdr = Math.round(state.r / 2.0);
    state.rcu = 0;
    state.rcb = state.rcu + rdr;
    const rdiff = Math.round((state.cs * Math.cos(alpha)) / HALF_LINK) + 2;
    if (state.rotationSpeed > 0) {
      state.rru = rdiff;
      state.rrb = state.rru + rdr;
    } else {
      state.rrb = state.frb - rdiff;
      state.rru = state.rrb - rdr;
    }

    this.moduloState();
  }

  debugAngles(label: string, mina: number, ra: number, maxa: number): void {
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
          toDegreesHuman(maxa)
      );
    }
  }

  moduloState(): void {
    const state = this.state;
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

  setBroken(): void {
    this.broken = true;
    this.reset();
    this.setModified();
  }

  setModified(): void {
    this.rivets = this.rivetsCalculator.getRivets();
    this.modified = true;
    this.onceModified = true;
  }

  checkState(): void {
    const state = this.state;
    const fdr = this.state.getRivetIndex(state.fru - state.frb);
    const fdc = this.rivetsCalculator.getCogIndex(state.f, state.fcu - state.fcb);
    const rdr = this.state.getRivetIndex(state.rrb - state.rru);
    const rdc = this.rivetsCalculator.getCogIndex(state.r, state.rcb - state.rcu);
    if (fdr !== fdc || rdr !== rdc) {
      console.error(["invalid state", state]);
      this.setBroken();
    }
  }

  chainTensionUp(): void {
    const state = this.state;
    const rivets = this.rivets;
    const r1 = this.rivetsCalculator.getRivet(rivets, state.fru);
    const r2 = this.rivetsCalculator.getRivet(rivets, state.rru);
    const d = r1.dist(r2);
    const maxDist =
      state.halfLinkChain * this.state.getRivetIndex(state.rru - state.fru);
    if (d >= maxDist) {
      const inter = new BikeGearingCircle(r1.x, r1.y, maxDist).intersection(
        new BikeGearingCircle(0, 0, state.rradius)
      );
      if (inter.intersectOccurs) {
        let pinter: BikeGearingPoint;
        if (inter.p1.y < 0) {
          pinter = inter.p1 as BikeGearingPoint;
        } else {
          pinter = inter.p2 as BikeGearingPoint;
        }
        const currentRa = state.ra - state.rcu * state.rda;
        const newRa = comparableAngle(
          currentRa,
          BikeGearingPoint.ZERO.getAngle(pinter)
        );
        if (Math.abs(newRa - currentRa) > PHYSICS_CONSTANTS.COLLISION_TOLERANCE) {
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

  chainTensionDown(): void {
    const state = this.state;
    const rivets = this.rivets;
    const r1 = this.rivetsCalculator.getRivet(rivets, state.frb);
    const r2 = this.rivetsCalculator.getRivet(rivets, state.rrb);
    const d = r1.dist(r2);
    const maxDist =
      state.halfLinkChain * this.state.getRivetIndex(state.frb - state.rrb);
    if (d >= maxDist) {
      const inter = new BikeGearingCircle(r1.x, r1.y, maxDist).intersection(
        new BikeGearingCircle(0, 0, state.rradius)
      );
      if (inter.intersectOccurs) {
        let pinter: BikeGearingPoint;
        if (inter.p1.y > 0) {
          pinter = inter.p1 as BikeGearingPoint;
        } else {
          pinter = inter.p2 as BikeGearingPoint;
        }
        const currentRa = state.ra - state.rcb * state.rda;
        const newRa = comparableAngle(
          currentRa,
          BikeGearingPoint.ZERO.getAngle(pinter)
        );
        if (Math.abs(newRa - currentRa) > PHYSICS_CONSTANTS.COLLISION_TOLERANCE) {
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

  fixRivet(
    label: string,
    ir1: number,
    ir2: number,
    front: boolean,
    c: number,
    f1: () => void,
    f2: () => void
  ): void {
    const rivets = this.rivets;
    const r1 = this.rivetsCalculator.getRivet(rivets, ir1);
    const r2 = this.rivetsCalculator.getRivet(rivets, ir2);
    let pm1: BikeGearingPoint, p: BikeGearingPoint, pp1: BikeGearingPoint;
    if (front) {
      pm1 = this.rivetsCalculator.getFrontCogPoint(c - 1);
      p = this.rivetsCalculator.getFrontCogPoint(c);
      pp1 = this.rivetsCalculator.getFrontCogPoint(c + 1);
    } else {
      pm1 = this.rivetsCalculator.getRearCogPoint(c - 1);
      p = this.rivetsCalculator.getRearCogPoint(c);
      pp1 = this.rivetsCalculator.getRearCogPoint(c + 1);
    }

    const ra = r1.getAngle(r2);
    const cam1 = comparableAngle(ra, pm1.getAngle(p));
    const cap1 = comparableAngle(ra, p.getAngle(pp1));
    const mina = Math.min(cap1, cam1);
    const maxa = Math.max(cap1, cam1);

    if (ra < mina - PHYSICS_CONSTANTS.COLLISION_TOLERANCE) {
      this.debugAngles(label + " ra < mina", mina, ra, maxa);
      f1();
      this.setModified();
    } else if (ra > maxa + PHYSICS_CONSTANTS.COLLISION_TOLERANCE) {
      this.debugAngles(label + " ra > maxa", mina, ra, maxa);
      f2();
      this.setModified();
    }
  }

  logCompute(s: unknown[]): void {
    if (this.state.debugCompute) {
      console.log(s);
    }
  }

  computeLoop(): void {
    const state = this.state;
    let stepIterations = 0;
    let overflow = false;
    this.rivets = this.rivetsCalculator.getRivets();
    do {
      this.iterations++;
      stepIterations++;
      this.modified = false;
      if (stepIterations >= PHYSICS_CONSTANTS.MAX_ITERATIONS) {
        console.warn(
          `Physics computation overflow after ${PHYSICS_CONSTANTS.MAX_ITERATIONS} iterations`
        );
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
        }
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
        }
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
        }
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
        }
      );
    } while (this.modified && !overflow);
  }

  compute(dtchrono: number): void {
    const state = this.state;
    const start = performance.now();

    this.logCompute(["start compute"]);

    const dt = state.simulationSpeed * (dtchrono / 1000);
    state.t += dt;

    const rpa = state.ra;

    const fda = dt * ((state.rotationSpeed * TWO_PI) / 60.0);
    const fra = state.fa + fda;

    this.onceModified = false;
    this.modified = false;
    this.broken = false;
    this.iterations = 0;

    let forced = false;
    if (dtchrono === 0) {
      forced = true;
    }
    while (
      !this.broken &&
      (Math.abs(state.fa - fra) > PHYSICS_CONSTANTS.ANGLE_TOLERANCE || forced)
    ) {
      if (fda > 0) {
        state.fa = state.fa + PHYSICS_CONSTANTS.ANGLE_STEP;
        if (state.fa > fra) {
          state.fa = fra;
        }
      } else {
        state.fa = state.fa - PHYSICS_CONSTANTS.ANGLE_STEP;
        if (state.fa < fra) {
          state.fa = fra;
        }
      }
      this.computeLoop();
      forced = false;
    }
    this.moduloState();

    const rda = comparableAngle(0, state.ra - rpa);

    const distchronokm = (2100 / (1000 * 1000)) * (rda / TWO_PI);
    const dtchronoh = dtchrono / (1000 * 3600);
    const speedkmh = distchronokm / dtchronoh;

    state.speedkmh = speedkmh;

    const rotation = fda / TWO_PI;
    const dtchronomin = dtchrono / (1000 * 60);
    const rpm = rotation / dtchronomin;

    state.rpm = rpm;

    const computeDuration = performance.now() - start;
    state.computeLog =
      this.onceModified +
      " " +
      this.iterations +
      " " +
      roundHuman(computeDuration, 1) +
      "ms";
    this.logCompute(["end compute"]);
  }
}
