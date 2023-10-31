function getArcEnd(r, a) {
  return {
    x: r * Math.cos(a),
    y: r * Math.sin(a),
  };
}

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

  if (debug) {
    ctx.save();
    ctx.fillStyle = "#055";
    ctx.strokeStyle = "#055";
    ctx.lineWidth = 0.1;
    ctx.fillText("" + cog.i, cog.r + 10, 0);
    ctx.beginPath();
    ctx.lineTo(cog.r, 0);
    let cog2 = getArcEnd(cog.r, cog.da);
    ctx.lineTo(cog2.x, cog2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(c1.x, c1.y, 1.6, a, a - aup, true);
  ctx.arc(cog.r, 0, 3.7, am, -am);
  ctx.arc(c2.x, c2.y, 1.6, aup - a, -a, true);
  ctx.stroke();
  ctx.closePath();

  if (cog.i == 0) {
    ctx.save();

    ctx.translate(cog.r - 10, 0);
    ctx.rotate(Math.PI / 2);

    ctx.font = "10px serif";
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    ctx.strokeText(cog.count, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawCogs(state) {
  ctx.save();
  ctx.translate(state.cs, 0);

  for (let i = 0; i < state.f; i++) {
    drawCog({
      count: state.f,
      r: state.fradius,
      i: i,
      a: state.fa - i * state.fda,
      da: state.fda,
    });
  }
  ctx.restore();
  for (let i = 0; i < state.r; i++) {
    drawCog({
      count: state.r,
      r: state.rradius,
      i: i,
      a: state.ra - i * state.rda,
      da: state.rda,
    });
  }
}
