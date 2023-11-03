import { BikeGearingPoint } from "./math.js";
import BikeGearingState from "./state.js";

const aup = (70 * Math.PI) / 180;
const am = Math.PI - (60 * Math.PI) / 180;

class BikeGearingCogs {
  /**
   * @param {Number} n
   * @param {Number} r
   * @param {Number} a
   * @param {Number} da
   */
  constructor(n, r, a, da) {
    /** Number of cogs */
    this.n = n;
    /** Radius */
    this.r = r;
    /**  Cogs angle */
    this.a = a;
    /** Angle between two cogs */
    this.da = da;
  }
}

class BikeGearingCogsDrawer {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {BikeGearingState} state
   */
  constructor(ctx, state) {
    this.ctx = ctx;
    this.state = state;
  }

  /**
   * @param {BikeGearingCogs} cogs
   * @param {Number} i
   */
  drawCog(cogs, i) {
    let ctx = this.ctx;
    // https://www.geogebra.org/geometry/xdgnvmz3
    // rear_tooth_2.png
    ctx.save();

    ctx.rotate(cogs.a - i * cogs.da);

    let c1 = BikeGearingPoint.getArcEnd(cogs.r + 2, cogs.da / 2);
    let c2 = BikeGearingPoint.getArcEnd(cogs.r + 2, -cogs.da / 2);
    let a = cogs.da / 2;

    ctx.arc(c1.x, c1.y, 1.6, a, a - aup, true);
    ctx.arc(cogs.r, 0, 3.7, am, -am);
    ctx.arc(c2.x, c2.y, 1.6, aup - a, -a, true);

    ctx.restore();
  }

  /**
   * @param {BikeGearingCogs} cogs
   * @param {Number} i
   */
  drawCogDebug(cogs, i) {
    let ctx = this.ctx;

    ctx.save();
    ctx.rotate(cogs.a - i * cogs.da);
    ctx.fillText("" + cogs.i, cogs.r + 10, 0);
    //  ctx.fillText("" + cog.i + " " + (cog.n - cog.i), cog.r + 10, 0);
    ctx.beginPath();
    ctx.lineTo(cogs.r, 0);
    let cog2 = BikeGearingPoint.getArcEnd(cogs.r, cogs.da);
    ctx.lineTo(cog2.x, cog2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  /**
   * @param {BikeGearingCogs} cogs
   */
  drawCogsLabel(cogs) {
    let ctx = this.ctx;
    ctx.save();
    ctx.rotate(cogs.a);
    ctx.translate(cogs.r - 10, 0);
    ctx.rotate(Math.PI / 2);

    ctx.font = "10px serif";
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    ctx.strokeText(cogs.n, 0, 0);
    ctx.restore();
  }

  /**
   * @param {BikeGearingCogs} cogs
   */
  drawCogsInternal(cogs) {
    let ctx = this.ctx;
    let debug = this.state.debug;

    ctx.fillStyle = "#ddd";
    ctx.strokeStyle = "#000";

    ctx.beginPath();
    for (let i = 0; i < cogs.n; i++) {
      this.drawCog(cogs, i);
    }
    ctx.stroke();
    if (!debug) {
      ctx.fill();
    }
    ctx.closePath();
    if (debug) {
      ctx.save();
      ctx.fillStyle = "#055";
      ctx.strokeStyle = "#055";
      ctx.lineWidth = 0.1;
      for (let i = 0; i < cogs.n; i++) {
        this.drawCogDebug(cogs, i);
      }
      ctx.restore();
    }

    this.drawCogsLabel(cogs);
  }

  drawFrontCogs() {
    let state = this.state;
    let ctx = this.ctx;
    ctx.save();
    ctx.translate(state.cs, 0);
    this.drawCogsInternal(
      new BikeGearingCogs(state.f, state.fradius, state.fa, state.fda)
    );
    ctx.restore();
  }

  drawRearCogs() {
    let state = this.state;
    this.drawCogsInternal(
      new BikeGearingCogs(state.r, state.rradius, state.ra, state.rda)
    );
  }

  drawCogs() {
    this.drawFrontCogs();
    this.drawRearCogs();
  }
}

export default BikeGearingCogsDrawer;
