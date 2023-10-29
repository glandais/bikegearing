let canvas;
let ctx;

function getArcEnd(r, a) {
  return {
    x: r * Math.cos(a),
    y: r * Math.sin(a),
  }
}

function drawCog(cog) {
  // https://www.geogebra.org/geometry/xdgnvmz3
  // rear_tooth_2.png
  ctx.save();

  ctx.rotate(cog.a);

  const c1 = getArcEnd(r + 2, cog.da / 2)
  const c2 = getArcEnd(r + 2, - cog.da / 2)
  const a = cog.da / 2;
  const aup = 70 * Math.PI / 180;

  ctx.beginPath();
  ctx.arc(c1.x, c1.y, 1.7, a, a - aup, true);
  ctx.arc(cog.r, 0, 3.7, 2 * Math.PI / 3, - 2 * Math.PI / 3);
  ctx.arc(c2.x, c2.y, 1.7, aup - a, -a, true);
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function drawCogs(cogs) {
  da = (2.0 * Math.PI) / cogs.c; // angle between two cogs
  r = halfLink / 2 / Math.sin(da / 2.0); // radius to rivet - drawing1.jpg
  for (let i = 0; i < cogs.c; i++) {
    drawCog({ r: r, a: cogs.a + i * da, da: da });
  }
}

function drawRivetsFront(state) {
  for (let i = state.fu - state.clf; i <= state.fu; i++) {
    const rn = (i + state.cl * 2) % (state.cl * 2);
  }
}

function drawRivetsRear(state) {}

function drawRivetsUp(state) {}

function drawRivetsDown(state) {}

function draw() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.save();

  ctx.lineWidth = 0.3;

  ctx.translate(cameraOffset.x, cameraOffset.y);
  ctx.scale(cameraZoom, cameraZoom);

  ctx.save();
  ctx.translate(state.cs, 0);
  drawCogs({ c: state.f, a: state.af });
  drawRivetsFront(state);
  ctx.restore();

  drawCogs({ c: state.r, a: state.ar });
  drawRivetsRear(state);

  drawRivetsUp(state);
  drawRivetsDown(state);

  ctx.restore();

  requestAnimationFrame(draw);
}
