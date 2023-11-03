import { HALF_LINK } from "./constants.js";
import BikeGearingState from "./state.js";
import BikeGearingDrawer from "./drawer.js";
import { BikeGearingPoint } from "./math.js";

class BikeGearingRivetsDrawer {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {BikeGearingState} state
   * @param {BikeGearingDrawer} drawer
   */
  constructor(ctx, state, drawer) {
    this.ctx = ctx;
    this.state = state;
    this.drawer = drawer;
  }

  drawRawRivet() {
    let ctx = this.ctx;
    let r = 5;
    let dcx1 = HALF_LINK / 8;
    let dcx2 = HALF_LINK / 4;
    let dy = 1;
    ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.bezierCurveTo(
      dcx1,
      -r,
      HALF_LINK / 2 - dcx2,
      -r + dy,
      HALF_LINK / 2,
      -r + dy,
    );
    ctx.bezierCurveTo(
      HALF_LINK / 2 + dcx2,
      -r + dy,
      HALF_LINK - dcx1,
      -r,
      HALF_LINK,
      -r,
    );
    ctx.arc(HALF_LINK, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.bezierCurveTo(
      HALF_LINK - dcx1,
      r,
      HALF_LINK / 2 + dcx2,
      r - dy,
      HALF_LINK / 2,
      r - dy,
    );
    ctx.bezierCurveTo(HALF_LINK / 2 - dcx2, r - dy, dcx1, r, 0, r);
  }

  /**
   * @param {BikeGearingPoint} r1
   * @param {BikeGearingPoint} r2
   * @param {Number} i
   */
  drawLink(r1, r2, i) {
    let debug = this.state.debug;
    let ctx = this.ctx;
    let d = r1.dist(r2);

    ctx.save();
    ctx.translate(r1.x, r1.y);
    let a = r1.getAngle(r2);
    ctx.rotate(a);

    let stretch = 0;
    if (d < HALF_LINK) {
      stretch = (d - HALF_LINK) / d;
    } else if (d > this.state.halfLinkChain) {
      stretch = (d - this.state.halfLinkChain) / d;
    }

    if (debug) {
      ctx.lineWidth = 0.1;
      ctx.fillStyle = "#000";
      let perc = Math.round(stretch * 1000);
      ctx.fillText(i + " " + perc, 0, 5);
      this.drawer.drawCircle(0, 0, 3.7);

      ctx.save();
      if (stretch > 0.0001) {
        stretch = Math.max(0.025, stretch);
      }
      if (stretch < -0.0001) {
        stretch = Math.min(-0.025, stretch);
      }
      let h =
        120 - Math.max(-120, Math.min(120, Math.round((120 * stretch) / 0.05)));
      ctx.strokeStyle = "hsla(" + h + ", 100%, 50%, 1)";

      ctx.beginPath();
      let dy = 0;
      if (i % 2 == 1) {
        dy = 1;
      } else {
        dy = -1;
      }
      ctx.moveTo((d - HALF_LINK) / 2, dy);
      ctx.lineTo((d - HALF_LINK) / 2, 0);
      ctx.lineTo(d - (d - HALF_LINK) / 2, 0);
      ctx.lineTo(d - (d - HALF_LINK) / 2, dy);
      ctx.stroke();
      ctx.closePath();

      ctx.restore();
    }

    ctx.translate((d - HALF_LINK) / 2, 0);

    let astretch = Math.abs(stretch);
    if (astretch > 0.0001) {
      let s = Math.max(50, Math.min(100, Math.round((100 * stretch) / 0.05)));
      ctx.fillStyle = "hsla(0, " + s + "%, 87%, 1)";
    } else {
      ctx.fillStyle = "hsla(0, 0%, 87%, 1)";
    }

    ctx.beginPath();
    this.drawRawRivet();
    if (!debug) {
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();

    if (!debug && i % 2 == 1) {
      ctx.fillStyle = "#ccc";
      this.drawer.drawCircle(0, 0, 2, true);
      this.drawer.drawCircle(d, 0, 2, true);
    }
    if (i % 10 == 1) {
      ctx.save();
      ctx.font = "3.5px serif";
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "#000";
      ctx.strokeText("GLA", d / 2, 0.4);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * @param {BikeGearingPoint[]} rivets
   */
  drawLinks(rivets) {
    for (let i = 0; i < rivets.length - 1; i = i + 2) {
      this.drawLink(rivets[i], rivets[i + 1], i);
    }
    this.drawLink(rivets[rivets.length - 1], rivets[0], rivets.length - 1);
    for (let i = 1; i < rivets.length - 1; i = i + 2) {
      this.drawLink(rivets[i], rivets[i + 1], i);
    }
  }
}

export default BikeGearingRivetsDrawer;
