
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

    const dx1 = (cog.r + 2) * Math.cos(0.8 * cog.da / 2);
    const dy1 = (cog.r + 2) * Math.sin(0.8 * cog.da / 2);

    const dx2 = (cog.r + 5) * Math.cos(cog.da / 2);
    const dy2 = (cog.r + 5) * Math.sin(cog.da / 2);

    ctx.beginPath();
    ctx.moveTo(cog.r, 3);
    // ctx.lineTo(dx1, dy1);
    ctx.lineTo(dx2, dy2);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(cog.r, 0, 3, Math.PI / 2, - Math.PI / 2, false);
    ctx.stroke();
    ctx.closePath();
   
    ctx.beginPath();
    ctx.moveTo(cog.r, -3);
    // ctx.lineTo(dx1, -dy1);
    ctx.lineTo(dx2, -dy2);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

function drawCogs(cogs) {
    console.log("cogs: " + cogs.c);
    da = 2.0 * Math.PI / cogs.c; // angle between two cogs
    console.log("da: " + da);
    r = (halfLink / 2) / Math.sin(da / 2.0); // radius to rivet
    console.log("r: " + r);

    // ctx.beginPath();

    // ctx.arc(0, 0, r - 2, 0, 2 * Math.PI);
    // ctx.stroke();

    // ctx.closePath();

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