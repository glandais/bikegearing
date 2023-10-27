
let canvas;
let ctx;

function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function initDraw() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.translate(100, 300);
    ctx.scale(2, 2)
}

function drawCog(cog) {
    ctx.save();

    ctx.rotate(cog.a);

    const dx2 = (cog.r + 5) * Math.cos(cog.da / 2);
    const dy2 = (cog.r + 5) * Math.sin(cog.da / 2);

    ctx.beginPath();
    ctx.moveTo(dx2, dy2);
    ctx.bezierCurveTo(dx2, dy2 - 1, cog.r + 2, 3, cog.r, 3)

    ctx.arc(cog.r, 0, 3, Math.PI / 2, - Math.PI / 2, false);

    ctx.moveTo(cog.r, -3);
    ctx.bezierCurveTo(cog.r + 2, -3, dx2, - dy2 + 1, dx2, -dy2)

    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

function drawCogs(cogs) {
    da = 2.0 * Math.PI / cogs.c; // angle between two cogs
    r = (halfLink / 2) / Math.sin(da / 2.0); // radius to rivet
    for (let i = 0; i < cogs.c; i++) {
        drawCog({ r: r, a: cogs.a + i * da, da: da });
    }
}

function draw(status) {
    clear();
    
    ctx.save();
    ctx.translate(status.cs, 0);
    drawCogs({c: status.f, a: status.af})
    ctx.restore();
    
    drawCogs({c: status.r, a: status.ar})
}