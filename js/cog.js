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

  const c1 = getArcEnd(cog.r + 2, cog.da / 2);
  const c2 = getArcEnd(cog.r + 2, -cog.da / 2);
  const a = cog.da / 2;

  if (debug) {
    ctx.save();
    ctx.fillStyle = "#055";
    ctx.strokeStyle = "#055";
    ctx.lineWidth = 0.1;
    ctx.fillText("" + cog.i, cog.r + 10, 0);
    ctx.beginPath();
    ctx.lineTo(cog.r, 0);
    const cog2 = getArcEnd(cog.r, cog.da);
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

  ctx.restore();
}

function drawCogs(state) {
  ctx.save();
  ctx.translate(state.cs, 0);

  if (false && debug) {
    ctx.save();
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, state.fradius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  for (let i = 0; i < state.f; i++) {
    drawCog({
      r: state.fradius,
      i: i,
      a: state.fa - i * state.daf,
      da: state.daf,
    });
  }
  ctx.restore();

  if (false && debug) {
    ctx.save();
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, state.rradius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  for (let i = 0; i < state.r; i++) {
    drawCog({
      r: state.rradius,
      i: i,
      a: state.ra - i * state.dar,
      da: state.dar,
    });
  }
}
