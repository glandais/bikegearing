import { HALF_LINK } from "./constants.js";
import { reduce } from "./math.js";

class BikeGearingState {
  constructor() {
    this.internalf = 51;
    this.internalr = 15;
    this.f = 51;
    this.r = 15;
    this.reset();
  }
  reset() {
    /** teeth front */
    this.f = 51;
    /** teeth rear */
    this.r = 15;
    /** chainstay (mm) */
    this.cs = 406;
    /** chain length in rivets (mm -> cl * 2.54 / 2) */
    this.cl = 98;

    /** angle front */
    this.fa = 0;
    /** cog hole number where chain is leaving front - up */
    this.fcu = 0;
    /** rivet number on fcu */
    this.fru = 0;
    /** cog hole number where chain is leaving front - bottom */
    this.fcb = 0;
    /** rivet number on fcb */
    this.frb = 0;

    /** angle rear */
    this.ra = 0;
    /** cog hole number where chain is leaving rear - up */
    this.rcu = 0;
    /** rivet number on rcu */
    this.rru = 0;
    /** cog hole number where chain is leaving rear - bottom */
    this.rcb = 0;
    /** rivet number on rcb */
    this.rrb = 0;

    this.modified = "";

    this.debug = false;
    this.debugCompute = false;
    this.simulationSpeed = 1.0;
    this.rotationSpeed = 80.0;
    this.paused = false;

    this.followRivet = false;

    this.doDrawWheel = true;

    this.halfLinkChain = HALF_LINK;

    this.fps = 0.0;
    this.t = 0.0;
  }
  /** Number of cogs front */
  get f() {
    return this.internalf;
  }
  /** Number of cogs front */
  set f(value) {
    this.internalf = value;
    /** angle between two cogs - front */
    this.fda = (2.0 * Math.PI) / this.internalf;
    /** radius to rivet - front - drawing1.jpg */
    this.fradius = HALF_LINK / 2 / Math.sin(this.fda / 2.0);
    this.computeSkidPatches();
  }
  /** Number of teeth cogs rear */
  get r() {
    return this.internalr;
  }
  /** Number of teeth cogs rear */
  set r(value) {
    this.internalr = value;
    /** angle between two cogs - rear */
    this.rda = (2.0 * Math.PI) / this.internalr;
    /** radius to rivet - rear - drawing1.jpg */
    this.rradius = HALF_LINK / 2 / Math.sin(this.rda / 2.0);
    this.computeSkidPatches();
  }
  computeSkidPatches() {
    // https://www.icebike.org/skid-patch-calculator/
    let reduced = reduce(this.f, this.r);
    this.skidPatchesSingleLegged = reduced[1];
    if (reduced[0] % 2 == 0) {
      this.skidPatchesAmbidextrous = reduced[1];
    } else {
      this.skidPatchesAmbidextrous = reduced[1] * 2;
    }
  }
  /**
   * @param {Number} i
   */
  getRivetIndex(i) {
    while (i < 0) {
      i = i + this.cl;
    }
    return i % this.cl;
  }
}

export default BikeGearingState;
