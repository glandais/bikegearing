import { TWO_PI } from "./constants.js";
import type { CircleIntersectionResult } from "./types.js";

export class BikeGearingPoint {
  static ZERO: BikeGearingPoint = new BikeGearingPoint(0, 0);

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static getArcEnd(r: number, a: number): BikeGearingPoint {
    return new BikeGearingPoint(r * Math.cos(a), r * Math.sin(a));
  }

  dist(p: BikeGearingPoint): number {
    return Math.hypot(this.x - p.x, this.y - p.y);
  }

  /**
   * Return point between this and p at ratio
   */
  ratio(p: BikeGearingPoint, r: number): BikeGearingPoint {
    return new BikeGearingPoint(
      this.x + r * (p.x - this.x),
      this.y + r * (p.y - this.y)
    );
  }

  getAngle(p: BikeGearingPoint): number {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
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

export class BikeGearingCircle {
  x: number;
  y: number;
  r: number;

  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  /**
   * https://stackoverflow.com/a/68092269
   */
  intersection(c: BikeGearingCircle): CircleIntersectionResult {
    // Start constructing the response object.
    const result: CircleIntersectionResult = {
      intersectCount: 0,
      intersectOccurs: true,
      oneIsInOther: false,
      areEqual: false,
      p1: new BikeGearingPoint(0, 0),
      p2: new BikeGearingPoint(0, 0),
    };

    // Get vertical and horizontal distances between circles.
    const dx = c.x - this.x;
    const dy = c.y - this.y;

    // Calculate the distance between the circle centers as a straight line.
    const dist = Math.hypot(dy, dx);

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
    }

    // Find the intersection points
    if (result.intersectOccurs) {
      // Centroid is the pt where two lines cross. A line between the circle centers
      // and a line between the intersection points.
      const centroid = (this.r * this.r - c.r * c.r + dist * dist) / (2.0 * dist);

      // Get the coordinates of centroid.
      const x2 = this.x + (dx * centroid) / dist;
      const y2 = this.y + (dy * centroid) / dist;

      // Get the distance from centroid to the intersection points.
      const h = Math.sqrt(this.r * this.r - centroid * centroid);

      // Get the x and y dist of the intersection points from centroid.
      const rx = -dy * (h / dist);
      const ry = dx * (h / dist);

      // Get the intersection points.
      result.p1.x = x2 + rx;
      result.p1.y = y2 + ry;

      result.p2.x = x2 - rx;
      result.p2.y = y2 - ry;

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

export function roundHuman(v: number, d: number): number {
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
}

export function toDegreesHuman(a: number): number {
  return roundHuman((180.0 * a) / Math.PI, 1);
}

export function comparableAngle(a1: number, a2: number): number {
  let a = a2;
  const minA = a1 - Math.PI / 2 - 0.01;
  while (a < minA) {
    a = a + TWO_PI;
  }
  const maxA = a1 + Math.PI / 2 + 0.01;
  while (a > maxA) {
    a = a - TWO_PI;
  }
  return a;
}

// https://stackoverflow.com/a/4652513
// Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
export function reduce(numerator: number, denominator: number): [number, number] {
  const gcdFn = (a: number, b: number): number => {
    return b ? gcdFn(b, a % b) : a;
  };
  const gcd = gcdFn(numerator, denominator);
  return [numerator / gcd, denominator / gcd];
}
