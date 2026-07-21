/**
 * 2D Vector & Geometry Utility Library
 */

export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }

  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  scale(s) {
    return new Vector2D(this.x * s, this.y * s);
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    if (len < 1e-9) return new Vector2D(0, 0);
    return new Vector2D(this.x / len, this.y / len);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  rotate(angleRad) {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  perp() {
    return new Vector2D(-this.y, this.x);
  }

  equals(v, epsilon = 1e-4) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }
}

/**
 * Computes ray-ray intersection: Ray 1 from p1 in dir v1, Ray 2 from p2 in dir v2
 * Returns Vector2D or null if parallel / no intersection on positive ray
 */
export function rayRayIntersection(p1, v1, p2, v2, epsilon = 1e-6) {
  const det = v1.cross(v2);
  if (Math.abs(det) < epsilon) return null; // Parallel or collinear

  const dp = p2.sub(p1);
  const t = dp.cross(v2) / det;
  const u = dp.cross(v1) / det;

  if (t >= -epsilon && u >= -epsilon) {
    return p1.add(v1.scale(t));
  }
  return null;
}

/**
 * Line segment intersection (p1-p2) with (p3-p4)
 */
export function lineSegmentIntersection(p1, p2, p3, p4, epsilon = 1e-6) {
  const v1 = p2.sub(p1);
  const v2 = p4.sub(p3);
  const det = v1.cross(v2);

  if (Math.abs(det) < epsilon) return null;

  const dp = p3.sub(p1);
  const t = dp.cross(v2) / det;
  const u = dp.cross(v1) / det;

  if (t >= -epsilon && t <= 1 + epsilon && u >= -epsilon && u <= 1 + epsilon) {
    return p1.add(v1.scale(t));
  }
  return null;
}

/**
 * Distance from point P to line segment A-B
 */
export function pointToSegmentDistance(p, a, b) {
  const ab = b.sub(a);
  const lenSq = ab.x * ab.x + ab.y * ab.y;
  if (lenSq < 1e-9) return p.distanceTo(a);

  let t = p.sub(a).dot(ab) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projection = a.add(ab.scale(t));
  return p.distanceTo(projection);
}
