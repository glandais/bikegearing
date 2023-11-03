import { TWO_PI } from "./constants.js";
import BikeGearingDrawer from "./drawer.js";
import { BikeGearingPoint } from "./math.js";
import BikeGearingState from "./state.js";

class BikeGearingWheelDrawer {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {BikeGearingState} state
   * @param {BikeGearingDrawer} drawer
   */
  constructor(ctx, state, drawer) {
    this.ctx = ctx;
    this.state = state;
    this.drawer = drawer;
    this.wheel = {
      total: (622 + 2 * 23) / 2,
      rim: 622 / 2,
      brakeHeight: 11,
      rimHeight: 32,
      hub: 90 / 2,
      hubSpoke: 84 / 2,
    };
  }

  drawWheelCircle(d, c) {
    let ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = c;
    ctx.strokeStyle = "#000";
    this.drawer.drawCircle(0, 0, d, true);
    ctx.restore();
  }

  drawValveRect(w, h, dx) {
    let debug = this.state.debug;
    let ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(dx, h / 2);
    ctx.lineTo(dx + w, h / 2);
    ctx.lineTo(dx + w, -h / 2);
    ctx.lineTo(dx, -h / 2);
    ctx.lineTo(dx, h / 2);
    if (!debug) {
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
  }

  drawValve() {
    let ctx = this.ctx;
    let wheel = this.wheel;
    ctx.save();

    ctx.translate(wheel.rim - wheel.rimHeight, 0);
    ctx.rotate(Math.PI);

    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "#000";

    ctx.fillStyle = "#ad8052";
    this.drawValveRect(22, 6, 0);
    this.drawValveRect(5, 5, 22);
    ctx.fillStyle = "#aaa";
    this.drawValveRect(5, 4, 27);
    ctx.fillStyle = "#ad8052";
    this.drawValveRect(3, 2, 32);

    ctx.restore();
  }

  drawLogo(textRadius, color, text, rotation) {
    let ctx = this.ctx;
    ctx.save();

    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";

    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.font = "bold 12px serif";
    let currentString = "";
    let totd = ctx.measureText(text).width;
    let baseAngle = -totd / 2 / textRadius;
    for (let i = 0; i < text.length; i++) {
      let char = text.charAt(i);

      ctx.save();

      let d = ctx.measureText(currentString).width;

      ctx.rotate(baseAngle + d / textRadius);
      ctx.translate(textRadius, 0);
      ctx.rotate(Math.PI / 2);

      ctx.lineWidth = 0.5;
      ctx.fillText(char, 0, 0);

      ctx.restore();
      currentString = currentString + char;
    }
    ctx.restore();
  }

  drawNipples() {
    let ctx = this.ctx;
    let wheel = this.wheel;
    ctx.save();
    ctx.rotate(TWO_PI / (24 * 2));
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#999";
    for (let i = 0; i < 24; i++) {
      ctx.save();
      ctx.rotate((i * TWO_PI) / 24);
      ctx.translate(wheel.rim - wheel.rimHeight, 0);
      ctx.rotate(Math.PI);
      this.drawValveRect(9, 3, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  drawSpokes(behindHub) {
    let ctx = this.ctx;
    let wheel = this.wheel;
    for (let i = 0; i < 24; i++) {
      if (!behindHub && i % 4 == 2) {
        ctx.save();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#444";
        ctx.rotate((i * TWO_PI) / 24);
        this.drawer.drawCircle(wheel.hubSpoke, 0, 2, true);
        ctx.restore();
      }
      if (!behindHub && i % 4 == 0) {
        ctx.save();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#ddd";
        ctx.rotate((i * TWO_PI) / 24);
        this.drawer.drawCircle(wheel.hubSpoke, 0, 1.5, true);
        ctx.restore();
      }
      if ((behindHub && i % 4 != 0) || (!behindHub && i % 4 == 0)) {
        ctx.save();

        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        ctx.rotate((i * TWO_PI) / 24);
        let a;
        if (i % 2 == 0) {
          a = (3.5 * TWO_PI) / 24;
        } else {
          a = (-2.5 * TWO_PI) / 24;
        }

        ctx.beginPath();
        ctx.moveTo(wheel.hubSpoke, 0);
        let e = BikeGearingPoint.getArcEnd(wheel.rim - wheel.rimHeight - 9, a);
        ctx.lineTo(e.x, e.y);

        ctx.stroke();
        ctx.closePath();

        ctx.restore();
      }
    }
  }

  drawWheel() {
    let ctx = this.ctx;
    let wheel = this.wheel;

    ctx.save();
    ctx.rotate(this.state.ra);

    this.drawWheelCircle(wheel.total, "#555");
    this.drawWheelCircle(wheel.rim, "#eee");
    this.drawWheelCircle(wheel.rim - wheel.brakeHeight, "#ddd");
    this.drawWheelCircle(wheel.rim - wheel.rimHeight, "#fff");

    this.drawSpokes(true);
    this.drawWheelCircle(wheel.hub, "#eee");
    this.drawSpokes(false);

    this.drawNipples();
    this.drawValve();
    this.drawLogo(wheel.rim + 4, "#fff", "N-Peloton", 0);
    this.drawLogo(
      wheel.rim + 4,
      "#fff",
      "My drinking team has a cycling problem",
      Math.PI,
    );

    this.drawLogo(
      wheel.rim - wheel.rimHeight + 2,
      "#000",
      "Fonderies",
      Math.PI / 2,
    );
    this.drawLogo(
      wheel.rim - wheel.rimHeight + 2,
      "#000",
      "Mercredi 20h30",
      -Math.PI / 2,
    );

    ctx.restore();
  }
}

export default BikeGearingWheelDrawer;
