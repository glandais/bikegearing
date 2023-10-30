function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getAngle(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let a = 0;
  if (Math.abs(dx) < 0.0001) {
    if (dy > 0) {
      a = Math.PI / 2;
    } else {
      a = -Math.PI / 2;
    }
  } else {
    a = Math.atan(dy / dx);
    if (dx < 0) {
      a = a + Math.PI;
    }
  }
  return a;
}
