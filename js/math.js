import { TWO_PI } from "./constants.js";

class BikeGearingPoint {
  /**
   * @param {Number} x
   * @param {Number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Number} r radius
   * @param {Number} a angle
   */
  static getArcEnd(r, a) {
    return new BikeGearingPoint(r * Math.cos(a), r * Math.sin(a));
  }

  /**
   * @param {BikeGearingPoint} p other point
   */
  dist(p) {
    return Math.hypot(this.x - p.x, this.y - p.y);
  }

  /**
   * Return point between this and p at ratio
   * @param {BikeGearingPoint} p other point
   * @param {Number} r ratio [0, 1]
   */
  ratio(p, r) {
    return new BikeGearingPoint(
      this.x + r * (p.x - this.x),
      this.y + r * (p.y - this.y)
    );
  }

  /**
   * @param {BikeGearingPoint} p other point
   */
  getAngle(p) {
    let dx = p.x - this.x;
    let dy = p.y - this.y;
    let a = 0;
    if (Math.abs(dx) < 0.00001) {
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
}
BikeGearingPoint.ZERO = new BikeGearingPoint(0, 0);

class BikeGearingCircle {
  /**
   * @param {Number} x center x
   * @param {Number} y center y
   * @param {Number} r radius
   */
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  /**
   * https://stackoverflow.com/a/68092269
   * @param {BikeGearingCircle} c other circle
   */
  intersection(c) {
    // Start constructing the response object.
    let result = {
      intersectCount: 0,
      intersectOccurs: true,
      oneIsInOther: false,
      areEqual: false,
      p1: new BikeGearingPoint(0, 0),
      p2: new BikeGearingPoint(0, 0),
    };

    // Get vertical and horizontal distances between circles.
    let dx = c.x - this.x;
    let dy = c.y - this.y;

    // Calculate the distance between the circle centers as a straight line.
    let dist = Math.hypot(dy, dx);

    // Check if circles intersect.
    if (dist > this.r + c.r) {
      result.intersectOccurs = false;
    }

    // Check one circle isn't inside the other.
    if (dist < Math.abs(this.r - c.r)) {
      result.intersectOccurs = false;
      result.oneIsInOther = true;
    }

    // Check if circles are the same.
    if (this.x === c.x && this.y === c.y && this.r === c.r) {
      result.areEqual = true;
      result.areEqual = true;
    }

    // Find the intersection points
    if (result.intersectOccurs) {
      // Centroid is the pt where two lines cross. A line between the circle centers
      // and a line between the intersection points.
      let centroid = (this.r * this.r - c.r * c.r + dist * dist) / (2.0 * dist);

      // Get the coordinates of centroid.
      let x2 = this.x + (dx * centroid) / dist;
      let y2 = this.y + (dy * centroid) / dist;

      // Get the distance from centroid to the intersection points.
      let h = Math.sqrt(this.r * this.r - centroid * centroid);

      // Get the x and y dist of the intersection points from centroid.
      let rx = -dy * (h / dist);
      let ry = dx * (h / dist);

      // Get the intersection points.
      result.p1.x = Number((x2 + rx).toFixed(15));
      result.p1.y = Number((y2 + ry).toFixed(15));

      result.p2.x = Number((x2 - rx).toFixed(15));
      result.p2.y = Number((y2 - ry).toFixed(15));

      // Add intersection count to results
      if (result.areEqual) {
        result.intersectCount = null;
      } else if (result.p1.x === result.p2.x && result.p1.y === result.p2.y) {
        result.intersectCount = 1;
      } else {
        result.intersectCount = 2;
      }
    }
    return result;
  }
}

/**
 * @param {Number} v value
 * @param {Number} d decimals count
 */
function roundHuman(v, d) {
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
}

/**
 * @param {Number} a angle (rad)
 */
function toDegreesHuman(a) {
  return roundHuman((180.0 * a) / Math.PI, 1);
}

/**
 * @param {Number} a1
 * @param {Number} a2
 */
function comparableAngle(a1, a2) {
  let a = a2;
  let minA = a1 - Math.PI / 2 - 0.01;
  while (a < minA) {
    a = a + TWO_PI;
  }
  let maxA = a1 + Math.PI / 2 + 0.01;
  while (a > maxA) {
    a = a - TWO_PI;
  }
  return a;
}

// https://stackoverflow.com/a/4652513
// Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
function reduce(numerator, denominator) {
  var gcd = function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  };
  gcd = gcd(numerator, denominator);
  return [numerator / gcd, denominator / gcd];
}

export {
  BikeGearingPoint,
  BikeGearingCircle,
  roundHuman,
  toDegreesHuman,
  comparableAngle,
  reduce,
};
