function drawRawRivet() {
    let r = 5;
    let dcx1 = HALF_LINK / 8;
    let dcx2 = HALF_LINK / 4;
    let dy = 1;
    ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.bezierCurveTo(dcx1, -r, HALF_LINK / 2 - dcx2, -r + dy, HALF_LINK / 2, -r + dy);
    ctx.bezierCurveTo(HALF_LINK / 2 + dcx2, -r + dy, HALF_LINK - dcx1, -r, HALF_LINK, -r);
    ctx.arc(HALF_LINK, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.bezierCurveTo(HALF_LINK - dcx1, r, HALF_LINK / 2 + dcx2, r - dy, HALF_LINK / 2, r - dy);
    ctx.bezierCurveTo(HALF_LINK / 2 - dcx2, r - dy, dcx1, r, 0, r);
}

function drawRivet(rivet) {
    let p1 = rivet.p1;
    let p2 = rivet.p2;
    let rn = rivet.rn;

    let d = dist(p1, p2);

    ctx.save();
    ctx.translate(p1.x, p1.y);
    let a = getAngle(p1, p2);
    ctx.rotate(a);

    let stretch = 0;
    if (d < HALF_LINK) {
        stretch = (d - HALF_LINK) / d;
    } else if (d > halfLinkChain) {
        stretch = (d - halfLinkChain) / d;
    }

    if (debug) {
        ctx.lineWidth = 0.1;
        ctx.fillStyle = "#000";
        let perc = Math.round(stretch * 1000);
        ctx.fillText(rn + " " + perc, 0, 5);
        drawCircle(0, 0, 3.7);

        ctx.save();
        if (stretch > 0.0001) {
            stretch = Math.max(0.025, stretch);
        }
        if (stretch < -0.0001) {
            stretch = Math.min(-0.025, stretch);
        }
        let h = 120 - Math.max(-120, Math.min(120, Math.round(120 * stretch / 0.05)));
        ctx.strokeStyle = "hsla(" + h + ", 100%, 50%, 1)";

        ctx.beginPath();
        let dy = 0;
        if (rivet.rn % 2 == 1) {
            dy = 1;
        } else {
            dy = -1;
        }
        ctx.moveTo((d - HALF_LINK) / 2, dy);
        ctx.lineTo((d - HALF_LINK) / 2, 0);
        ctx.lineTo(d - (d - HALF_LINK) / 2, 0);
        ctx.lineTo(d - (d - HALF_LINK) / 2, dy);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    ctx.translate((d - HALF_LINK) / 2, 0);

    let astretch = Math.abs(stretch);
    if (astretch > 0.0001) {
        let s = Math.max(50, Math.min(100, Math.round(100 * stretch / 0.05)));
        ctx.fillStyle = "hsla(0, " + s + "%, 87%, 1)";
    } else {
        ctx.fillStyle = "hsla(0, 0%, 87%, 1)";
    }

    ctx.beginPath();
    drawRawRivet();
    if (!debug) {
        ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();

    if (!debug && rivet.rn % 2 == 1) {
        ctx.fillStyle = "#ccc";
        drawCircle(0, 0, 2, true);
        drawCircle(d, 0, 2, true);
    }
    if (rivet.rn % 10 == 1) {
        ctx.save();
        ctx.font = "3.5px serif";
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "#000";
        ctx.strokeText("GLA", d / 2, 0.4);
        ctx.restore();
    }

    ctx.restore();
}

function drawRivets(rivets) {
    rivets.forEach((rivet) => {
        if (rivet.rn % 2 == 0) {
            drawRivet(rivet);
        }
    });
    rivets.forEach((rivet) => {
        if (rivet.rn % 2 == 1) {
            drawRivet(rivet);
        }
    });
}
