/**
 * Islamic & Andalusian Hankin "Polygons in Contact" (PIC) Generator
 * Implements Hankin's method for geometric star and rosette patterns
 */

import { BaseGenerator } from './base-generator.js';
import { Vector2D, rayRayIntersection } from '../geometry/vector.js';

export class IslamicHankinGenerator extends BaseGenerator {
  constructor() {
    super(
      'islamic-hankin',
      'Islamic & Andalusian (Hankin Star Method)',
      'Polygons in Contact (PIC) star and rosette generator based on Hankin and Lee methods.'
    );
  }

  getDefaultConfig() {
    return {
      deltaPct: 50,          // Contact position as percentage along edge (50 = midpoint)
      angleDeg: 45,          // Contact angle in degrees (e.g. 30, 45, 60)
      showGrid: true,        // Output guide grid layer
      enableHatching: false, // Enable pen-width-aware hatch fills
      hatchAngleDeg: 45,     // Angle of hatching lines
    };
  }

  generatePattern(tiles, config, penProfile, paperBounds) {
    const delta = (config.deltaPct ?? 50) / 100;
    const angleRad = ((config.angleDeg ?? 45) * Math.PI) / 180;
    const nibMm = penProfile.nibDiameterMm || 0.7;

    const gridPolylines = [];
    const motifPolylines = [];
    const hatchPolylines = [];

    // 1. Optional Guide Grid Layer
    if (config.showGrid) {
      for (const tile of tiles) {
        const poly = [...tile.vertices, tile.vertices[0]];
        gridPolylines.push(poly);
      }
    }

    // 2. Hankin Motif Generation
    for (const tile of tiles) {
      const edges = tile.getEdges();
      const numEdges = edges.length;

      // Calculate contact points on each edge
      const contactPoints = [];
      for (let i = 0; i < numEdges; i++) {
        const edge = edges[i];
        // v1 -> v2
        const p1 = edge.v1.add(edge.v2.sub(edge.v1).scale(1 - delta));
        const p2 = edge.v1.add(edge.v2.sub(edge.v1).scale(delta));

        // Rays inward towards center
        const inDir1 = edge.normal.rotate(angleRad);
        const inDir2 = edge.normal.rotate(-angleRad);

        contactPoints.push({ p1, p2, inDir1, inDir2, normal: edge.normal });
      }

      // Intersect adjacent edge rays inside tile
      const starRays = [];
      for (let i = 0; i < numEdges; i++) {
        const curr = contactPoints[i];
        const next = contactPoints[(i + 1) % numEdges];

        // Ray from curr.p2 along curr.inDir2 and Ray from next.p1 along next.inDir1
        const inter = rayRayIntersection(curr.p2, curr.inDir2, next.p1, next.inDir1);
        if (inter && inter.distanceTo(tile.center) < tile.vertices[0].distanceTo(tile.center) * 1.5) {
          motifPolylines.push([curr.p2, inter]);
          motifPolylines.push([next.p1, inter]);
          starRays.push(inter);
        } else {
          // Fallback ray to tile center
          motifPolylines.push([curr.p2, tile.center]);
          motifPolylines.push([next.p1, tile.center]);
        }
      }

      // Optional Hatching Fills inside Star Polygons
      if (config.enableHatching && starRays.length >= 3) {
        this.generateHatchFill(starRays, config.hatchAngleDeg || 45, nibMm * 1.2, hatchPolylines);
      }
    }

    // Return Grouped Layers
    const layers = [];

    if (gridPolylines.length > 0) {
      layers.push({
        id: 'guide-grid',
        name: 'Layer 1: Guide Grid',
        color: '#78909c',
        penNibMm: 0.35,
        polylines: gridPolylines,
      });
    }

    layers.push({
      id: 'star-motif',
      name: `Layer 2: ${penProfile.layerName || 'Star Motif'}`,
      color: penProfile.color || '#1e88e5',
      penNibMm: nibMm,
      polylines: motifPolylines,
    });

    if (hatchPolylines.length > 0) {
      layers.push({
        id: 'hatch-fill',
        name: 'Layer 3: Hatch Fill (Shading)',
        color: '#424242',
        penNibMm: nibMm,
        polylines: hatchPolylines,
      });
    }

    return layers;
  }

  // Hatching generator inside star polygon
  generateHatchFill(polygonVertices, angleDeg, stepMm, outPolylines) {
    if (polygonVertices.length < 3) return;

    const angleRad = (angleDeg * Math.PI) / 180;
    const dir = new Vector2D(Math.cos(angleRad), Math.sin(angleRad));
    const normal = dir.perp();

    // Project polygon onto normal to find min/max range
    let minN = Infinity;
    let maxN = -Infinity;
    for (const p of polygonVertices) {
      const proj = p.dot(normal);
      minN = Math.min(minN, proj);
      maxN = Math.max(maxN, proj);
    }

    for (let n = minN + stepMm; n < maxN; n += stepMm) {
      // Line: P = n * normal + t * dir
      const origin = normal.scale(n);
      const intersections = [];

      const numV = polygonVertices.length;
      for (let i = 0; i < numV; i++) {
        const a = polygonVertices[i];
        const b = polygonVertices[(i + 1) % numV];

        const inter = rayRayIntersection(origin, dir, a, b.sub(a));
        if (inter) {
          // Check if intersection is within segment a-b
          const ab = b.sub(a);
          const t = inter.sub(a).dot(ab) / (ab.length() * ab.length());
          if (t >= 0 && t <= 1) {
            intersections.push(inter);
          }
        }
      }

      if (intersections.length >= 2) {
        intersections.sort((p1, p2) => p1.dot(dir) - p2.dot(dir));
        for (let k = 0; k < intersections.length - 1; k += 2) {
          outPolylines.push([intersections[k], intersections[k + 1]]);
        }
      }
    }
  }
}
