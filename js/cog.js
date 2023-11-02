const aup = (70 * Math.PI) / 180;
const am = Math.PI - (60 * Math.PI) / 180;

function drawCog(cog) {
  // https://www.geogebra.org/geometry/xdgnvmz3
  // rear_tooth_2.png
  ctx.save();

  ctx.rotate(cog.a);

  let c1 = getArcEnd(cog.r + 2, cog.da / 2);
  let c2 = getArcEnd(cog.r + 2, -cog.da / 2);
  let a = cog.da / 2;

  ctx.arc(c1.x, c1.y, 1.6, a, a - aup, true);
  ctx.arc(cog.r, 0, 3.7, am, -am);
  ctx.arc(c2.x, c2.y, 1.6, aup - a, -a, true);

  ctx.restore();
}

function drawCogDebug(cog) {
  ctx.save();
  ctx.rotate(cog.a);
  ctx.fillText("" + cog.i, cog.r + 10, 0);
//  ctx.fillText("" + cog.i + " " + (cog.count - cog.i), cog.r + 10, 0);
  ctx.beginPath();
  ctx.lineTo(cog.r, 0);
  let cog2 = getArcEnd(cog.r, cog.da);
  ctx.lineTo(cog2.x, cog2.y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawCogsLabel(cogs) {
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

function drawAnyCogs(cogs) {

  ctx.fillStyle = "#ddd";
  ctx.strokeStyle = "#000";

  ctx.beginPath();
  for (let i = 0; i < cogs.n; i++) {
    drawCog({
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
      drawCogDebug({
        count: cogs.n,
        r: cogs.r,
        i: i,
        a: cogs.a - i * cogs.da,
        da: cogs.da,
      });
    }
    ctx.restore();
  }

  drawCogsLabel(cogs);
}

function drawFrontCogs(state) {
  ctx.save();
  ctx.translate(state.cs, 0);
  drawAnyCogs({
    n: state.f,
    r: state.fradius,
    a: state.fa,
    da: state.fda
  });
  ctx.restore();
}

function drawRearCogs(state) {
  drawAnyCogs({
    n: state.r,
    r: state.rradius,
    a: state.ra,
    da: state.rda
  });
}

function drawCogs(state) {
  drawFrontCogs(state);
  drawRearCogs(state);
}
