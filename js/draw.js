let canvas;
let ctx;

function drawCog(cog) {
  ctx.save();

  ctx.rotate(cog.a);

  const dx2 = (cog.r + 5) * Math.cos(cog.da / 2);
  const dy2 = (cog.r + 5) * Math.sin(cog.da / 2);

  ctx.beginPath();
  ctx.moveTo(dx2, dy2);
  ctx.bezierCurveTo(dx2, dy2 - 1, cog.r + 2, 3, cog.r, 3);

  ctx.arc(cog.r, 0, 3, Math.PI / 2, -Math.PI / 2, false);

  ctx.moveTo(cog.r, -3);
  ctx.bezierCurveTo(cog.r + 2, -3, dx2, -dy2 + 1, dx2, -dy2);

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

function draw() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.save();

  ctx.translate(cameraOffset.x, cameraOffset.y);
  ctx.scale(cameraZoom, cameraZoom);

  ctx.save();
  ctx.translate(state.cs, 0);
  drawCogs({ c: state.f, a: state.af });
  ctx.restore();

  drawCogs({ c: state.r, a: state.ar });

  ctx.restore();

  requestAnimationFrame(draw);
}
