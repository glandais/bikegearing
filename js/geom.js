function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getAngle(p1, p2) {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
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

function ratio(p1, p2, r) {
  return {
    x: p1.x + r * (p2.x - p1.x),
    y: p1.y + r * (p2.y - p1.y)
  }
}
/**
 * @description Get information about the intersection points of a circle.
 * Adapted from: https://stackoverflow.com/a/12221389/5553768.
 * @param {Object} c1 An object describing the first circle.
 * @param {float} c1.x The x coordinate of the circle.
 * @param {float} c1.y The y coordinate of the circle.
 * @param {float} c1.r The radius of the circle.
 * @param {Object} c2 An object describing the second circle.
 * @param {float} c2.x The x coordinate of the circle.
 * @param {float} c2.y The y coordinate of the circle.
 * @param {float} c2.r The radius of the circle.
 * @returns {Object} Data about the intersections of the circles.
 */
function intersection(c1, c2) {
  // Start constructing the response object.
  let result = {
    intersect_count: 0,
    intersect_occurs: true,
    one_is_in_other: false,
    are_equal: false,
    point_1: { x: null, y: null },
    point_2: { x: null, y: null },
  };

  // Get vertical and horizontal distances between circles.
  let dx = c2.x - c1.x;
  let dy = c2.y - c1.y;

  // Calculate the distance between the circle centers as a straight line.
  let dist = Math.hypot(dy, dx);

  // Check if circles intersect.
  if (dist > c1.r + c2.r) {
    result.intersect_occurs = false;
  }

  // Check one circle isn't inside the other.
  if (dist < Math.abs(c1.r - c2.r)) {
    result.intersect_occurs = false;
    result.one_is_in_other = true;
  }

  // Check if circles are the same.
  if (c1.x === c2.x && c1.y === c2.y && c1.r === c2.r) {
    result.are_equal = true;
    result.are_equal = true;
  }

  // Find the intersection points
  if (result.intersect_occurs) {
    // Centroid is the pt where two lines cross. A line between the circle centers
    // and a line between the intersection points.
    let centroid = (c1.r * c1.r - c2.r * c2.r + dist * dist) / (2.0 * dist);

    // Get the coordinates of centroid.
    let x2 = c1.x + (dx * centroid) / dist;
    let y2 = c1.y + (dy * centroid) / dist;

    // Get the distance from centroid to the intersection points.
    let h = Math.sqrt(c1.r * c1.r - centroid * centroid);

    // Get the x and y dist of the intersection points from centroid.
    let rx = -dy * (h / dist);
    let ry = dx * (h / dist);

    // Get the intersection points.
    result.point_1.x = Number((x2 + rx).toFixed(15));
    result.point_1.y = Number((y2 + ry).toFixed(15));

    result.point_2.x = Number((x2 - rx).toFixed(15));
    result.point_2.y = Number((y2 - ry).toFixed(15));

    // Add intersection count to results
    if (result.are_equal) {
      result.intersect_count = null;
    } else if (result.point_1.x === result.point_2.x && result.point_1.y === result.point_2.y) {
      result.intersect_count = 1;
    } else {
      result.intersect_count = 2;
    }
  }
  return result;
}

function comparableAngle(a1, a2) {
  let a = a2;
  let minA = a1 - Math.PI;
  do {
    a = a + 2 * Math.PI;
  } while (a < minA);
  let maxA = a1 + Math.PI;
  do {
    a = a - 2 * Math.PI;
  } while (a > maxA);
  return a;
}