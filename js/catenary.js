/*
function getL(p1, p2, a, cx) {
    return a * Math.sinh((p1.x - cx) / a) + a * Math.sinh((p2.x - cx) / a);
}

function between(v1, v2, v) {
    return (v1 <= v && v <= v2) ||
        (v2 <= v && v <= v1);
}

function getCx(p1, p2, l, cxMin, cxMax) {
    const cx = (cxMax - cxMin) / 2;
    if (cxMax - cxMin < 1) {
        return (cxMax - cxMin) / 2;
    }
    const lCxMin = getL(p1, p2, a, cxMin);
    const lCx = getL(p1, p2, a, cx);
    const lCxMax = getL(p1, p2, a, cxMax);
    if (between(lCxMin, lCx)) {
        return getCx(p1, p2, l, cxMin, cx);
    } else {
        return getCx(p1, p2, l, cx, cxMax);
    }
}

function testCatenary() {
    const p1 = { x: 100, y: 100 };
    const p2 = { x: 300, y: 50 };
    const a = 50;
    getCx(p1, p2, 500, )
    for (let i = 0; i <= 100; i++) {
        const cx = (i / 100.0) * (p2.x - p1.x);
        const l1 = a * Math.sinh((p1.x - cx) / a);
        const l2 = a * Math.sinh((p2.x - cx) / a);
        console.log(i + " " + Math.round(cx) + " " + Math.round(l1 + l2) + " " + Math.round(l1) + " " + Math.round(l2))
    }
}
*/