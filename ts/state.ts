import { HALF_LINK } from "./constants.js";
import { computeSkidPatches } from "./math.js";

export default class BikeGearingState {
  private internalf: number = 51;
  private internalr: number = 15;

  // Teeth counts and derived properties
  fda: number = 0;
  fradius: number = 0;
  rda: number = 0;
  rradius: number = 0;

  // Chainstay length (mm)
  cs: number = 406;

  // Chain length in rivets
  cl: number = 98;

  // Front angles and cog indices
  fa: number = 0;
  fcu: number = 0;
  fru: number = 0;
  fcb: number = 0;
  frb: number = 0;

  // Rear angles and cog indices
  ra: number = 0;
  rcu: number = 0;
  rru: number = 0;
  rcb: number = 0;
  rrb: number = 0;

  // Skid patches
  skidPatchesSingleLegged: number = 0;
  skidPatchesAmbidextrous: number = 0;

  // State tracking
  modified: string = "";

  // Debug and simulation
  debug: boolean = false;
  debugCompute: boolean = false;
  simulationSpeed: number = 1.0;
  rotationSpeed: number = 80.0;
  paused: boolean = false;

  followRivet: boolean = false;

  doDrawWheel: boolean = true;

  halfLinkChain: number = HALF_LINK;

  // Performance metrics
  fps: number = 0.0;
  t: number = 0.0;
  speedkmh: number = 0;
  rpm: number = 0;
  computeLog: string = "";
  drawDuration: number = 0;

  constructor() {
    this.f = 51;
    this.r = 15;
    this.reset();
  }

  reset(): void {
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
  get f(): number {
    return this.internalf;
  }

  /** Number of cogs front */
  set f(value: number) {
    this.internalf = value;
    /** angle between two cogs - front */
    this.fda = (2.0 * Math.PI) / this.internalf;
    /** radius to rivet - front - drawing1.jpg */
    this.fradius = HALF_LINK / 2 / Math.sin(this.fda / 2.0);
    this.updateSkidPatches();
  }

  /** Number of teeth cogs rear */
  get r(): number {
    return this.internalr;
  }

  /** Number of teeth cogs rear */
  set r(value: number) {
    this.internalr = value;
    /** angle between two cogs - rear */
    this.rda = (2.0 * Math.PI) / this.internalr;
    /** radius to rivet - rear - drawing1.jpg */
    this.rradius = HALF_LINK / 2 / Math.sin(this.rda / 2.0);
    this.updateSkidPatches();
  }

  updateSkidPatches(): void {
    const skidPatched = computeSkidPatches(this.f, this.r)
    this.skidPatchesSingleLegged = skidPatched[0];
    this.skidPatchesAmbidextrous = skidPatched[1];
  }

  getRivetIndex(i: number): number {
    while (i < 0) {
      i = i + this.cl;
    }
    return i % this.cl;
  }
}
