class BikeGearingDrawer {
  constructor(ctx, state, rivetsCalculator, interactive) {
    this.ctx = ctx;
    this.state = state;
    this.rivetsCalculator = rivetsCalculator;
    this.interactive = interactive;
    this.cogsDrawer = new BikeGearingCogsDrawer(ctx, state);
    this.rivetsDrawer = new BikeGearingRivetsDrawer(ctx, state, this);
    this.wheelDrawer = new BikeGearingWheelDrawer(ctx, state, this);
  }

  drawCircle(x, y, r, fill = false) {
    let ctx = this.ctx;
    let debug = this.state.debug;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, BikeGearingCogsMath.TWO_PI);
    if (fill && !debug) {
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
  }

  printStateValues(values) {
    let ctx = this.ctx;

    ctx.save();
    ctx.font = "16px serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    let maxWidth = 0;
    for (let i = 0; i < values.length; i++) {
      maxWidth = Math.max(maxWidth, ctx.measureText(values[i]).width);
    }
    ctx.fillRect(10, 4, maxWidth, 17 * values.length);
    ctx.fillStyle = "#000";
    for (let i = 0; i < values.length; i++) {
      ctx.fillText(values[i], 10, 20 + 17 * i);
    }
    ctx.restore();
  }

  getCommonValues() {
    let state = this.state;
    let wear = BikeGearingCogsMath.roundHuman(
      (100.0 * state.halfLinkChain) / BikeGearingState.HALF_LINK - 100.0,
      1
    );
    return [
      "Chain wear: " + wear + "%",
      "Simulation speed: " +
        BikeGearingCogsMath.roundHuman(state.simulationSpeed * 100, 0) +
        "%",
      "Rotation speed: " +
        BikeGearingCogsMath.roundHuman(state.rotationSpeed, 1) +
        "rpm",
      "Chainring cogs: " + state.f,
      "Sprocket cogs: " + state.r,
      "Single-legged skid patches: " + state.skidPatchesSingleLegged,
      "Ambidextrous skid patches: " + state.skidPatchesAmbidextrous,
      "Chainstay: " + BikeGearingCogsMath.roundHuman(state.cs, 2) + "mm",
      "Chain links: " + state.cl,
      "Speed (km/h): " + BikeGearingCogsMath.roundHuman(state.speedkmh, 1),
      "RPM: " + BikeGearingCogsMath.roundHuman(state.rpm, 1) + "rpm",
      "",
      "FPS: " + BikeGearingCogsMath.roundHuman(state.fps, 0),
    ];
  }

  getDebugValues() {
    let values = this.getCommonValues();
    let state = this.state;
    let debugValues = [
      "",
      "t: " + BikeGearingCogsMath.roundHuman(state.t, 5),
      "fa: " + BikeGearingCogsMath.toDegreesHuman(state.fa) + "°",
      "fcu: " + state.fcu,
      "fru: " + state.fru,
      "fcb: " + state.fcb,
      "frb: " + state.frb,
      "ra: " + BikeGearingCogsMath.toDegreesHuman(state.ra) + "°",
      "rcu: " + state.rcu,
      "rru: " + state.rru,
      "rcb: " + state.rcb,
      "rrb: " + state.rrb,
      "computeLog: " + state.computeLog,
      "Last draw: " +
        BikeGearingCogsMath.roundHuman(state.drawDuration, 2) +
        "ms",
      "cameraOffset.x: " +
        BikeGearingCogsMath.roundHuman(this.interactive.cameraOffset.x, 2),
      "cameraOffset.y: " +
        BikeGearingCogsMath.roundHuman(this.interactive.cameraOffset.y, 2),
      "cameraZoom: " +
        BikeGearingCogsMath.roundHuman(this.interactive.cameraZoom, 2),
      "worldWidth: " +
        BikeGearingCogsMath.roundHuman(this.interactive.worldWidth, 2),
    ];
    values.push(...debugValues);
    return values;
  }

  draw() {
    let ctx = this.ctx;
    let state = this.state;
    let debug = this.state.debug;
    let paused = this.state.paused;

    let start = performance.now();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (debug || paused) {
      ctx.fillStyle = "rgba(255,255,255,1.0)";
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.font = "5px serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.lineWidth = 0.3;

    ctx.translate(
      this.interactive.cameraOffset.x,
      this.interactive.cameraOffset.y
    );
    ctx.scale(this.interactive.cameraZoom, this.interactive.cameraZoom);

    let rivets = this.rivetsCalculator.getRivets();
    let r1, r2;
    if (state.followRivet) {
      r1 = this.rivetsCalculator.getRivet(rivets, 0);
      r2 = this.rivetsCalculator.getRivet(rivets, 1);
      if (r1 && r2) {
        let rivetAngle = BikeGearingCogsMath.getAngle(r1, r2);
        ctx.rotate(Math.PI - rivetAngle);
        ctx.translate(-r1.x, -r1.y);
      }
    }

    if (state.doDrawWheel) {
      this.wheelDrawer.drawWheel(state);
    }
    this.cogsDrawer.drawCogs(state);
    this.rivetsDrawer.drawLinks(rivets);

    if (state.followRivet) {
      if (r1) {
        ctx.beginPath();
        ctx.lineTo(r1.x - 5, r1.y);
        ctx.lineTo(r1.x + 5, r1.y);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.lineTo(r1.x, r1.y + 5);
        ctx.lineTo(r1.x, r1.y - 5);
        ctx.stroke();
        ctx.closePath();
      }
    }

    ctx.restore();

    if (debug) {
      this.printStateValues(this.getDebugValues(state));
    } else {
      this.printStateValues(this.getCommonValues(state));
    }
    state.drawDuration = performance.now() - start;
  }
}
