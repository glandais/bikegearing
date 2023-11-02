function getCatenary(p1, p2, l) {
    // https://math.stackexchange.com/a/3557768
    let x1, y1, x2, y2, inverted;
    if (p1.x < p2.x) {
        x1 = p1.x;
        y1 = -p1.y;
        x2 = p2.x;
        y2 = -p2.y;
        inverted = false;
    } else {
        x1 = p2.x;
        y1 = -p2.y;
        x2 = p1.x;
        y2 = -p1.y;
        inverted = true;
    }
    let dx = x2 - x1;
    let dy = y2 - y1;
    if (Math.sqrt(l * l) < (Math.sqrt(dx * dx + dy * dy) + 0.00001)) {
        return [
            p1, p2
        ];
    }

    let ax = (x2 + x1) / 2;
    let ay = (y2 + y1) / 2;

    // l² <= dx² + dy²
    // dx != 0
    let r = Math.sqrt(l * l - dy * dy) / dx
    // r = sinh(A)/A
    let A;
    if (r < 3) {
        A = Math.sqrt(6 * (r - 1));
    } else {
        A = Math.log(2 * r) + Math.log(Math.log(2 * r))
    }
    let diff = 0;
    do {
        A = A - ((Math.sinh(A) - r * A) / (Math.cosh(A) - r));
        diff = Math.abs(r - (Math.sinh(A) / A));
    } while (diff > 0.0000001);

    let a = dx / (2 * A);
    let b = ax - (a * Math.atanh(dy / l));
    let c = ay - (l / (2 * Math.tanh(A)));

    let nPoints = 100;
    let points = [];
    for (let i = 0; i <= nPoints; i++) {
        let x = x1 + i * (x2 - x1) / nPoints;
        let y = -(c + a * Math.cosh((x - b) / a));
        points.push({ x, y });
    }
    if (inverted) {
        points.reverse();
    }
    return points;
}

function catenary(p1, p2, l, n) {
    let points = getCatenary(p1, p2, l);

    let dseg = [];
    let dtot = 0;
    for (let i = 0; i < points.length - 1; i++) {
        let d = dist(points[i], points[i + 1]);
        dtot = dtot + d;
        dseg.push(d);
    }

    let result = [];

    let d = 0;
    let iseg = 0;
    let dl = dtot / n;

    for (let i = 0; i < dseg.length; i++) {
        let nd = d + dseg[i];

        let added = false;
        do {
            if (d - 0.001 <= iseg * dl && iseg * dl <= nd + 0.001) {
                let r = (iseg * dl - d) / (nd - d);
                let p = ratio(points[i], points[i + 1], r);
                result.push(p);
                iseg++;
                added = true;
            } else {
                added = false;
            }
        } while (added);

        d = nd;
    }
    return result;
}