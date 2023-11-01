
function drawWheelCircle(d, c) {
    ctx.fillStyle = c;
    ctx.strokeStyle = "#000";
    drawCircle(0, 0, d, true);
}

function drawValveRect(w, h, dx) {
    ctx.beginPath();
    ctx.moveTo(dx, h / 2);
    ctx.lineTo(dx + w, h / 2);
    ctx.lineTo(dx + w, -h / 2);
    ctx.lineTo(dx, -h / 2);
    ctx.lineTo(dx, h / 2);
    if (!debug) {
        ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
}

function drawValve(wheel) {
    ctx.save();

    ctx.translate((wheel.rim - wheel.rimHeight), 0);
    ctx.rotate(Math.PI);

    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "#000";

    ctx.fillStyle = "#ad8052";
    drawValveRect(22, 6, 0);
    drawValveRect(5, 5, 22);
    ctx.fillStyle = "#aaa";
    drawValveRect(5, 4, 27);
    ctx.fillStyle = "#ad8052";
    drawValveRect(3, 2, 32);

    ctx.restore();
}


function drawLogo(textRadius, color, wheelName, rotation) {
    ctx.save();

    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";

    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.font = "bold 12px serif";
    let currentString = "";
    let totd = ctx.measureText(wheelName).width;
    let baseAngle = (-totd / 2) / textRadius;
    for (let i = 0; i < wheelName.length; i++) {
        let char = wheelName.charAt(i);

        ctx.save();

        let d = ctx.measureText(currentString).width;

        ctx.rotate(baseAngle + d / textRadius);
        ctx.translate(textRadius, 0);
        ctx.rotate(Math.PI / 2);

        ctx.lineWidth = 0.5;
        ctx.fillText(char, 0, 0);

        ctx.restore();
        currentString = currentString + char;
    }
    ctx.restore();
}

function drawNipples(wheel) {
    ctx.save();
    ctx.rotate(TWO_PI / (24 * 2));
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#999";
    for (let i = 0; i < 24; i++) {
        ctx.save();
        ctx.rotate(i * TWO_PI / 24);
        ctx.translate((wheel.rim - wheel.rimHeight), 0);
        ctx.rotate(Math.PI);
        drawValveRect(9, 3, 0);
        ctx.restore();
    }
    ctx.restore();
}

function drawSpokes(wheel, behindHub) {
    for (let i = 0; i < 24; i++) {
        if (!behindHub && i % 4 == 2) {
            ctx.save();
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "#000";
            ctx.fillStyle = "#444";
            ctx.rotate(i * TWO_PI / 24);
            drawCircle(wheel.hubSpoke, 0, 2, true);
            ctx.restore();
        }
        if (!behindHub && i % 4 == 0) {
            ctx.save();
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "#000";
            ctx.fillStyle = "#ddd";
            ctx.rotate(i * TWO_PI / 24);
            drawCircle(wheel.hubSpoke, 0, 1.5, true);
            ctx.restore();
        }
        if ((behindHub && i % 4 != 0) || (!behindHub && i % 4 == 0)) {
            ctx.save();

            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;

            ctx.rotate(i * TWO_PI / 24);
            let a;
            if (i % 2 == 0) {
                a = 3.5 * TWO_PI / 24;
            } else {
                a = -2.5 * TWO_PI / 24;
            }

            ctx.beginPath();
            ctx.moveTo(wheel.hubSpoke, 0);
            let e = getArcEnd(wheel.rim - wheel.rimHeight - 9, a);
            ctx.lineTo(e.x, e.y);

            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }
    }
}

function drawWheel(state) {
    let wheel = {
        total: (622 + 2 * 23) / 2,
        rim: 622 / 2,
        brakeHeight: 11,
        rimHeight: 32,
        hub: 90 / 2,
        hubSpoke: 84 / 2
    }
    ctx.save();
    ctx.rotate(state.ra);

    drawWheelCircle(wheel.total, "#555");
    drawWheelCircle(wheel.rim, "#eee");
    drawWheelCircle(wheel.rim - wheel.brakeHeight, "#ddd");
    drawWheelCircle(wheel.rim - wheel.rimHeight, "#fff");

    drawSpokes(wheel, true);
    drawWheelCircle(wheel.hub, "#eee");
    drawSpokes(wheel, false);

    drawNipples(wheel);
    drawValve(wheel);
    drawLogo(wheel.rim + 4, "#fff", "N-Peloton", 0);
    drawLogo(wheel.rim + 4, "#fff", "My drinking team has a cycling problem", Math.PI);

    drawLogo(wheel.rim - wheel.rimHeight + 2, "#000", "Fonderies", Math.PI / 2);
    drawLogo(wheel.rim - wheel.rimHeight + 2, "#000", "Mercredi 20h30", -Math.PI / 2);

    ctx.restore();
}