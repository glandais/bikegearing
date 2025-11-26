import { BikeGearingPoint } from "./math.js";
import BikeGearingState from "./state.js";
import type { Ctx2D } from "./types.js";

const aup = (70 * Math.PI) / 180;
const am = Math.PI - (60 * Math.PI) / 180;

class BikeGearingCogs {
  /** Number of cogs */
  n: number;
  /** Radius */
  r: number;
  /** Cogs angle */
  a: number;
  /** Angle between two cogs */
  da: number;

  constructor(n: number, r: number, a: number, da: number) {
    this.n = n;
    this.r = r;
    this.a = a;
    this.da = da;
  }
}

export default class BikeGearingCogsDrawer {
  ctx: Ctx2D;
  state: BikeGearingState;

  constructor(ctx: Ctx2D, state: BikeGearingState) {
    this.ctx = ctx;
    this.state = state;
  }

  drawCog(cogs: BikeGearingCogs, i: number): void {
    const ctx = this.ctx;
    // https://www.geogebra.org/geometry/xdgnvmz3
    // rear_tooth_2.png
    ctx.save();

    ctx.rotate(cogs.a - i * cogs.da);

    const c1 = BikeGearingPoint.getArcEnd(cogs.r + 2, cogs.da / 2);
    const c2 = BikeGearingPoint.getArcEnd(cogs.r + 2, -cogs.da / 2);
    const a = cogs.da / 2;

    ctx.arc(c1.x, c1.y, 1.6, a, a - aup, true);
    ctx.arc(cogs.r, 0, 3.7, am, -am);
    ctx.arc(c2.x, c2.y, 1.6, aup - a, -a, true);

    ctx.restore();
  }

  drawCogDebug(cogs: BikeGearingCogs, i: number): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.rotate(cogs.a - i * cogs.da);
    ctx.fillText("" + i, cogs.r + 10, 0);
    ctx.beginPath();
    ctx.lineTo(cogs.r, 0);
    const cog2 = BikeGearingPoint.getArcEnd(cogs.r, cogs.da);
    ctx.lineTo(cog2.x, cog2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  drawCogsLabel(cogs: BikeGearingCogs): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(cogs.a);
    ctx.translate(cogs.r - 10, 0);
    ctx.rotate(Math.PI / 2);

    ctx.font = "10px serif";
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    ctx.strokeText(String(cogs.n), 0, 0);
    ctx.restore();
  }

  drawCogsInternal(cogs: BikeGearingCogs): void {
    const ctx = this.ctx;
    const debug = this.state.debug;

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

  drawFrontCogs(): void {
    const state = this.state;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(state.cs, 0);
    this.drawCogsInternal(
      new BikeGearingCogs(state.f, state.fradius, state.fa, state.fda)
    );
    ctx.restore();
  }

  drawRearCogs(): void {
    const state = this.state;
    this.drawCogsInternal(
      new BikeGearingCogs(state.r, state.rradius, state.ra, state.rda)
    );
  }

  drawCogs(): void {
    this.drawFrontCogs();
    this.drawRearCogs();
  }
}
