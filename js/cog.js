class BikeGearingCogsDrawer {
  constructor(ctx, state) {
    this.ctx = ctx;
    this.state = state;
  }

  drawCog(cog) {
    let ctx = this.ctx;
    // https://www.geogebra.org/geometry/xdgnvmz3
    // rear_tooth_2.png
    ctx.save();

    ctx.rotate(cog.a);

    let c1 = BikeGearingCogsMath.getArcEnd(cog.r + 2, cog.da / 2);
    let c2 = BikeGearingCogsMath.getArcEnd(cog.r + 2, -cog.da / 2);
    let a = cog.da / 2;

    ctx.arc(c1.x, c1.y, 1.6, a, a - BikeGearingCogsDrawer.aup, true);
    ctx.arc(cog.r, 0, 3.7, BikeGearingCogsDrawer.am, -BikeGearingCogsDrawer.am);
    ctx.arc(c2.x, c2.y, 1.6, BikeGearingCogsDrawer.aup - a, -a, true);

    ctx.restore();
  }

  drawCogDebug(cog) {
    let ctx = this.ctx;

    ctx.save();
    ctx.rotate(cog.a);
    ctx.fillText("" + cog.i, cog.r + 10, 0);
    //  ctx.fillText("" + cog.i + " " + (cog.count - cog.i), cog.r + 10, 0);
    ctx.beginPath();
    ctx.lineTo(cog.r, 0);
    let cog2 = BikeGearingCogsMath.getArcEnd(cog.r, cog.da);
    ctx.lineTo(cog2.x, cog2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

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

  drawCogsInternal(cogs) {
    let ctx = this.ctx;
    let debug = this.state.debug;

    ctx.fillStyle = "#ddd";
    ctx.strokeStyle = "#000";

    ctx.beginPath();
    for (let i = 0; i < cogs.n; i++) {
      this.drawCog({
        count: cogs.n,
        r: cogs.r,
        i: i,
        a: cogs.a - i * cogs.da,
        da: cogs.da,
      });
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
        this.drawCogDebug({
          count: cogs.n,
          r: cogs.r,
          i: i,
          a: cogs.a - i * cogs.da,
          da: cogs.da,
        });
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
    this.drawCogsInternal({
      n: state.f,
      r: state.fradius,
      a: state.fa,
      da: state.fda,
    });
    ctx.restore();
  }

  drawRearCogs() {
    let state = this.state;
    this.drawCogsInternal({
      n: state.r,
      r: state.rradius,
      a: state.ra,
      da: state.rda,
    });
  }

  drawCogs() {
    this.drawFrontCogs();
    this.drawRearCogs();
  }
}

BikeGearingCogsDrawer.aup = (70 * Math.PI) / 180;
BikeGearingCogsDrawer.am = Math.PI - (60 * Math.PI) / 180;
