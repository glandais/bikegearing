class BikeGearingState {
  constructor() {
    this.fda = 0.0;
    this.fradius = 0.0;

    this.skidPatchesSingleLegged = 0;
    this.skidPatchesAmbidextrous = 0;

    this.internalf = 51; // teeth front
    this.rda = 0.0;
    this.rradius = 0.0;
    this.internalr = 15; // teeth rear
    this.cs = 406; // chainstay (mm)
    this.cl = 98; // chain length in rivets (mm -> cl * 2.54 / 2)

    this.fa = 0; // angle front
    this.fcu = 0; // cog hole number where chain is leaving front - up
    this.fru = 0; // rivet number on fcu
    this.fcb = 0; // cog hole number where chain is leaving front - bottom
    this.frb = 0; // rivet number on fcb

    this.ra = 0; // angle rear
    this.rcu = 4; // cog hole number where chain is leaving rear - up
    this.rru = 50; // rivet number on rcu
    this.rcb = 0; // cog hole number where chain is leaving rear - bottom
    this.rrb = 0; // rivet number on fcb

    this.modified = "";

    this.debug = false;
    this.debugCompute = true;
    this.simulationSpeed = 1.0;
    this.rotationSpeed = 80.0;
    this.paused = false;

    this.followRivet = false;

    this.doDrawWheel = true;

    this.halfLinkChain = BikeGearingState.HALF_LINK;

    this.t = 0.0;

    this.reset();
  }
  get f() {
    return this.internalf;
  }
  set f(value) {
    this.internalf = value;
    this.fda = (2.0 * Math.PI) / this.internalf; // angle between two cogs
    this.fradius = BikeGearingState.HALF_LINK / 2 / Math.sin(this.fda / 2.0); // radius to rivet - drawing1.jpg
    this.computeSkidPatches();
  }
  get r() {
    return this.internalr;
  }
  set r(value) {
    this.internalr = value;
    this.rda = (2.0 * Math.PI) / this.internalr; // angle between two cogs
    this.rradius = BikeGearingState.HALF_LINK / 2 / Math.sin(this.rda / 2.0); // radius to rivet - drawing1.jpg
    this.computeSkidPatches();
  }
  computeSkidPatches() {
    // https://www.icebike.org/skid-patch-calculator/
    let reduced = BikeGearingCogsMath.reduce(this.f, this.r);
    this.skidPatchesSingleLegged = reduced[1];
    if (reduced[0] % 2 == 0) {
      this.skidPatchesAmbidextrous = reduced[1];
    } else {
      this.skidPatchesAmbidextrous = reduced[1] * 2;
    }
  }
  reset() {
    this.f = 51; // teeth front
    this.r = 15; // teeth rear
    this.cs = 406; // chainstay (mm)
    this.cl = 98; // chain length in rivets (mm -> cl * 2.54 / 2)

    this.fa = 0; // angle front
    this.fcu = 0; // cog hole number where chain is leaving front - up
    this.fru = 0; // rivet number on fcu
    this.fcb = 0; // cog hole number where chain is leaving front - bottom
    this.frb = 0; // rivet number on fcb

    this.ra = 0; // angle rear
    this.rcu = 0; // cog hole number where chain is leaving rear - up
    this.rru = 0; // rivet number on rcu
    this.rcb = 0; // cog hole number where chain is leaving rear - bottom
    this.rrb = 0; // rivet number on fcb

    this.modified = "";

    this.debug = false;
    this.debugCompute = false;
    this.simulationSpeed = 1.0;
    this.rotationSpeed = 80.0;
    this.paused = false;

    this.followRivet = false;

    this.doDrawWheel = true;

    this.halfLinkChain = BikeGearingState.HALF_LINK;

    this.t = 0.0;
  }
}
BikeGearingState.HALF_LINK = 25.4 / 2.0;
