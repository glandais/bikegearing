import { HALF_LINK } from "./constants.js";
import { BikeGearingPoint } from "./math.js";
import BikeGearingCatenary from "./catenary.js";
import BikeGearingState from "./state.js";

export default class BikeGearingRivetsCalculator {
  state: BikeGearingState;

  constructor(state: BikeGearingState) {
    this.state = state;
  }

  // FIXME see getRivetIndex
  getCogIndex(c: number, i: number): number {
    while (i < 0) {
      i = i + c;
    }
    return i % c;
  }

  getRivet(rivets: BikeGearingPoint[], i: number): BikeGearingPoint {
    return rivets[this.state.getRivetIndex(i)];
  }

  getFrontCogPoint(c: number): BikeGearingPoint {
    const a = this.state.fa - c * this.state.fda;
    return new BikeGearingPoint(
      this.state.cs + this.state.fradius * Math.cos(a),
      this.state.fradius * Math.sin(a)
    );
  }

  getRearCogPoint(c: number): BikeGearingPoint {
    const a = this.state.ra - c * this.state.rda;
    return new BikeGearingPoint(
      this.state.rradius * Math.cos(a),
      this.state.rradius * Math.sin(a)
    );
  }

  getRivetsUp(rivets: BikeGearingPoint[]): void {
    const s = this.getFrontCogPoint(this.state.fcu);
    const e = this.getRearCogPoint(this.state.rcu);
    const rc = this.state.getRivetIndex(this.state.rru - this.state.fru);
    const points = BikeGearingCatenary.getCatenaryIntervals(
      s,
      e,
      rc * HALF_LINK,
      rc
    );
    for (let i = 0; i < points.length; i++) {
      rivets.push(points[i]);
    }
  }

  getRivetsRear(rivets: BikeGearingPoint[]): void {
    const count = this.state.getRivetIndex(this.state.rrb - this.state.rru);
    for (let i = 1; i < count; i++) {
      const c = this.state.rcu + i;
      const p = this.getRearCogPoint(c);
      rivets.push(p);
    }
  }

  getRivetsDown(rivets: BikeGearingPoint[]): void {
    const s = this.getRearCogPoint(this.state.rcb);
    const e = this.getFrontCogPoint(this.state.fcb);
    const rc = this.state.getRivetIndex(this.state.frb - this.state.rrb);
    const points = BikeGearingCatenary.getCatenaryIntervals(
      s,
      e,
      rc * HALF_LINK,
      rc
    );
    for (let i = 0; i < points.length; i++) {
      rivets.push(points[i]);
    }
  }

  getRivetsFront(rivets: BikeGearingPoint[]): void {
    const count = this.state.getRivetIndex(this.state.fru - this.state.frb);
    for (let i = 1; i < count; i++) {
      const c = this.state.fcb + i;
      const p = this.getFrontCogPoint(c);
      rivets.push(p);
    }
  }

  getRivets(): BikeGearingPoint[] {
    const rivets: BikeGearingPoint[] = [];
    this.getRivetsUp(rivets);
    this.getRivetsRear(rivets);
    this.getRivetsDown(rivets);
    this.getRivetsFront(rivets);
    const result: BikeGearingPoint[] = [];
    for (let i = 0; i < this.state.cl; i++) {
      result.push(rivets[this.state.getRivetIndex(i - this.state.fru)]);
    }
    return result;
  }
}
