/**
 * Tiling Grid Engine
 * Generates periodic 2D regular and Archimedean tilings (4.4, 4.8.8, 6.6.6, 3.12.12, 3.6.3.6)
 */

import { Vector2D } from './vector.js';

export class Tile {
  /**
   * @param {string} shape - 'square', 'octagon', 'hexagon', 'triangle', 'dodecagon'
   * @param {Vector2D[]} vertices - Polygon vertices in order
   * @param {Vector2D} center - Polygon centroid
   */
  constructor(shape, vertices, center) {
    this.shape = shape;
    this.vertices = vertices;
    this.center = center;
  }

  getEdges() {
    const edges = [];
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const v1 = this.vertices[i];
      const v2 = this.vertices[(i + 1) % n];
      const mid = v1.add(v2).scale(0.5);
      const edgeVec = v2.sub(v1);
      const normal = edgeVec.perp().normalize();
      // Ensure normal points outwards from center
      if (normal.dot(mid.sub(this.center)) < 0) {
        normal.x = -normal.x;
        normal.y = -normal.y;
      }
      edges.push({ v1, v2, mid, length: edgeVec.length(), normal, index: i });
    }
    return edges;
  }
}

/**
 * Creates a regular polygon centered at center with given radius, start angle, and side count n
 */
export function createRegularPolygon(n, center, radius, startAngleRad = 0, shapeName = 'polygon') {
  const vertices = [];
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const angle = startAngleRad + i * step;
    vertices.push(
      new Vector2D(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle)
      )
    );
  }
  return new Tile(shapeName, vertices, center);
}

export class TilingEngine {
  /**
   * Generate tiling geometry over printable region
   * @param {string} tilingType - '4.8.8' | '4.4' | '6.6.6' | '3.12.12' | '3.6.3.6'
   * @param {number} scaleMm - Tile side length or grid unit scale in mm
   * @param {object} bounds - { left, top, right, bottom, centerX, centerY }
   */
  static generateTiling(tilingType, scaleMm, bounds) {
    const tiles = [];
    const side = Math.max(5, scaleMm);

    switch (tilingType) {
      case '4.8.8':
        TilingEngine.generate488(side, bounds, tiles);
        break;
      case '6.6.6':
        TilingEngine.generate666(side, bounds, tiles);
        break;
      case '3.12.12':
        TilingEngine.generate31212(side, bounds, tiles);
        break;
      case '3.6.3.6':
        TilingEngine.generate3636(side, bounds, tiles);
        break;
      case '4.4':
      default:
        TilingEngine.generate44(side, bounds, tiles);
        break;
    }

    return tiles;
  }

  // 4.4 Square Grid
  static generate44(side, bounds, tiles) {
    const minX = bounds.left - side;
    const maxX = bounds.right + side;
    const minY = bounds.top - side;
    const maxY = bounds.bottom + side;

    const startX = bounds.centerX - Math.floor((bounds.centerX - minX) / side) * side;
    const startY = bounds.centerY - Math.floor((bounds.centerY - minY) / side) * side;

    for (let x = startX; x <= maxX; x += side) {
      for (let y = startY; y <= maxY; y += side) {
        const center = new Vector2D(x, y);
        const radius = side / (2 * Math.sin(Math.PI / 4));
        tiles.push(createRegularPolygon(4, center, radius, Math.PI / 4, 'square'));
      }
    }
  }

  // 4.8.8 Octagon-Square Tiling
  static generate488(side, bounds, tiles) {
    // Octagon inradius r = s / (2 * tan(pi/8))
    const rOct = side / (2 * Math.tan(Math.PI / 8));
    const ROct = side / (2 * Math.sin(Math.PI / 8));
    // Grid period distance between octagons
    const period = 2 * rOct + side;

    const minX = bounds.left - period;
    const maxX = bounds.right + period;
    const minY = bounds.top - period;
    const maxY = bounds.bottom + period;

    const startX = bounds.centerX - Math.floor((bounds.centerX - minX) / period) * period;
    const startY = bounds.centerY - Math.floor((bounds.centerY - minY) / period) * period;

    for (let x = startX; x <= maxX; x += period) {
      for (let y = startY; y <= maxY; y += period) {
        // Main Octagon
        const octCenter = new Vector2D(x, y);
        tiles.push(createRegularPolygon(8, octCenter, ROct, Math.PI / 8, 'octagon'));

        // Square in the gap between 4 octagons
        const sqCenter = new Vector2D(x + period / 2, y + period / 2);
        const rSq = side / (2 * Math.sin(Math.PI / 4));
        tiles.push(createRegularPolygon(4, sqCenter, rSq, Math.PI / 4, 'square'));
      }
    }
  }

  // 6.6.6 Regular Hexagonal Tiling
  static generate666(side, bounds, tiles) {
    const rHex = side * Math.cos(Math.PI / 6);
    const RHex = side;
    const dx = 2 * rHex;
    const dy = 1.5 * RHex;

    const minX = bounds.left - 2 * dx;
    const maxX = bounds.right + 2 * dx;
    const minY = bounds.top - 2 * dy;
    const maxY = bounds.bottom + 2 * dy;

    let row = 0;
    for (let y = bounds.centerY - Math.floor((bounds.centerY - minY) / dy) * dy; y <= maxY; y += dy) {
      const offsetX = (row % 2 === 0) ? 0 : rHex;
      for (let x = bounds.centerX - Math.floor((bounds.centerX - minX) / dx) * dx + offsetX; x <= maxX; x += dx) {
        tiles.push(createRegularPolygon(6, new Vector2D(x, y), RHex, Math.PI / 6, 'hexagon'));
      }
      row++;
    }
  }

  // 3.12.12 Dodecagon-Triangle Tiling
  static generate31212(side, bounds, tiles) {
    const RDode = side / (2 * Math.sin(Math.PI / 12));
    const rDode = side / (2 * Math.tan(Math.PI / 12));
    const RTri = side / Math.sqrt(3);

    const period = 2 * rDode;
    const dx = period;
    const dy = period * Math.sin(Math.PI / 3);

    const minX = bounds.left - 2 * dx;
    const maxX = bounds.right + 2 * dx;
    const minY = bounds.top - 2 * dy;
    const maxY = bounds.bottom + 2 * dy;

    let row = 0;
    for (let y = bounds.centerY - Math.floor((bounds.centerY - minY) / dy) * dy; y <= maxY; y += dy) {
      const offsetX = (row % 2 === 0) ? 0 : dx / 2;
      for (let x = bounds.centerX - Math.floor((bounds.centerX - minX) / dx) * dx + offsetX; x <= maxX; x += dx) {
        const center = new Vector2D(x, y);
        tiles.push(createRegularPolygon(12, center, RDode, Math.PI / 12, 'dodecagon'));

        // Surrounding triangles
        const triCenter1 = center.add(new Vector2D(0, rDode + RTri / 2));
        tiles.push(createRegularPolygon(3, triCenter1, RTri, Math.PI / 2, 'triangle'));
      }
      row++;
    }
  }

  // 3.6.3.6 Kagome / Triangular-Hexagonal Tiling
  static generate3636(side, bounds, tiles) {
    const RHex = side;
    const rHex = side * Math.cos(Math.PI / 6);
    const RTri = side / Math.sqrt(3);
    const dx = 2 * side;
    const dy = side * Math.sqrt(3);

    const minX = bounds.left - 2 * dx;
    const maxX = bounds.right + 2 * dx;
    const minY = bounds.top - 2 * dy;
    const maxY = bounds.bottom + 2 * dy;

    for (let x = minX; x <= maxX; x += dx) {
      for (let y = minY; y <= maxY; y += dy) {
        const hexCenter = new Vector2D(x, y);
        tiles.push(createRegularPolygon(6, hexCenter, RHex, 0, 'hexagon'));

        // Triangular gaps
        tiles.push(createRegularPolygon(3, hexCenter.add(new Vector2D(side, 0)), RTri, Math.PI / 6, 'triangle'));
        tiles.push(createRegularPolygon(3, hexCenter.add(new Vector2D(-side, 0)), RTri, -Math.PI / 6, 'triangle'));
      }
    }
  }
}
