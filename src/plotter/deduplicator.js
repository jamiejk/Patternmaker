/**
 * Line Segment Deduplicator
 * Removes duplicate or reversed coincident line segments to prevent double-inking on plotters.
 */

export class LineDeduplicator {
  /**
   * Deduplicate an array of 2-point line segments or polylines
   * @param {Array<Vector2D[]>} polylines
   * @param {number} epsilon - Distance threshold in mm for vertex matching
   * @returns {Array<Vector2D[]>} Deduplicated polylines
   */
  static deduplicate(polylines, epsilon = 1e-3) {
    const result = [];
    const seenSegments = new Set();

    for (const poly of polylines) {
      if (poly.length < 2) continue;

      const newPoly = [poly[0]];
      for (let i = 0; i < poly.length - 1; i++) {
        const p1 = poly[i];
        const p2 = poly[i + 1];

        // Skip degenerate zero-length segments
        if (p1.distanceTo(p2) < epsilon) continue;

        // Hash segment bidirectionally
        const key = LineDeduplicator.segmentKey(p1, p2, epsilon);

        if (!seenSegments.has(key)) {
          seenSegments.add(key);
          newPoly.push(p2);
        }
      }

      if (newPoly.length >= 2) {
        result.push(newPoly);
      }
    }

    return result;
  }

  static segmentKey(p1, p2, epsilon) {
    const round = (val) => Math.round(val / epsilon) * epsilon;
    const k1 = `${round(p1.x)},${round(p1.y)}`;
    const k2 = `${round(p2.x)},${round(p2.y)}`;
    // Always sort keys so (A->B) matches (B->A)
    return (k1 < k2) ? `${k1}|${k2}` : `${k2}|${k1}`;
  }
}
