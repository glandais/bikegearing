function R(t, e, n, i, u, c) {
  const r = [
      // Calculate the first point on the curve
      [e.x, t * Math.cosh((e.x - i) / t) + u],
    ],
    s = n.x - e.x,
    o = c - 1;
  for (let x = 0; x < o; x++) {
    const y = e.x + (s * (x + 0.5)) / o,
      f = t * Math.cosh((y - i) / t) + u;
    r.push([y, f]);
  }
  return r.push([n.x, t * Math.cosh((n.x - i) / t) + u]), r;
}
function a(t) {
  return {
    type: "line",
    start: t[0],
    lines: t.slice(1),
  };
}
function T(t, e, n, i) {
  const u = Math.sqrt(n * n - e * e) / t;
  let c = Math.acosh(u) + 1,
    r = -1,
    s = 0;
  for (; Math.abs(c - r) > 1e-6 && s < i; )
    (r = c), (c = c - (Math.sinh(c) - u * c) / (Math.cosh(c) - u)), s++;
  return t / (2 * c);
}
function p(t) {
  let e = t.length - 1,
    n = t[1][0],
    i = t[1][1];
  const u = [t[0][0], t[0][1]],
    c = [];
  for (let r = 2; r < e; r++) {
    const s = t[r][0],
      o = t[r][1],
      x = (s + n) * 0.5,
      y = (o + i) * 0.5;
    c.push([n, i, x, y]), (n = s), (i = o);
  }
  return (
    (e = t.length),
    c.push([t[e - 2][0], t[e - 2][1], t[e - 1][0], t[e - 1][1]]),
    { type: "quadraticCurve", start: u, curves: c }
  );
}
function I(t, e) {
  t.type === "quadraticCurve" ? D(t, e) : t.type === "line" && P(t, e);
}
function P(t, e) {
  e.moveTo(...t.start);
  for (let n = 0; n < t.lines.length; n++) e.lineTo(...t.lines[n]);
}
function D(t, e) {
  e.moveTo(...t.start);
  for (let n = 0; n < t.curves.length; n++) e.quadraticCurveTo(...t.curves[n]);
}
function d(t, e) {
  return { x: t.x - e.x, y: t.y - e.y };
}
function E(t, e) {
  const n = d(t, e);
  return Math.sqrt(Math.pow(n.x, 2) + Math.pow(n.y, 2));
}
function L(t, e, n, i = {}) {
  const u = i.segments || 25,
    c = i.iterationLimit || 6,
    r = t.x > e.x,
    s = r ? e : t,
    o = r ? t : e;
  if (E(s, o) < n) {
    if (o.x - s.x > 0.01) {
      const v = o.x - s.x,
        h = o.y - s.y,
        l = -T(v, h, n, c),
        M = (l * Math.log((n + h) / (n - h)) - v) * 0.5,
        C = l * Math.cosh(M / l),
        w = s.x - M,
        q = s.y - C,
        m = R(l, s, o, w, q, u);
      return r && m.reverse(), p(m);
    }
    const f = (s.x + o.x) * 0.5,
      g = (s.y + o.y + n) * 0.5;
    return a([
      [s.x, s.y],
      [f, g],
      [o.x, o.y],
    ]);
  }
  return a([
    [s.x, s.y],
    [o.x, o.y],
  ]);
}
const getCatenaryCurve = L;
const drawResult = I;
