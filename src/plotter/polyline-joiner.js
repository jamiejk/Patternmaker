/**
 * Polyline Endpoint Joiner
 * Connects contiguous 2-point segments into long continuous polylines to reduce pen lifts.
 */

export class PolylineJoiner {
  /**
   * @param {Array<Vector2D[]>} polylines
   * @param {number} epsilon - Max distance to join endpoints
   * @returns {Array<Vector2D[]>} Joined continuous polylines
   */
  static join(polylines, epsilon = 1e-3) {
    if (!polylines || polylines.length === 0) return [];

    // Convert all polylines into mutable arrays
    let paths = polylines.map((p) => [...p]);
    let merged = true;

    while (merged) {
      merged = false;
      const nextPaths = [];

      for (let i = 0; i < paths.length; i++) {
        let current = paths[i];
        if (!current) continue;

        let findMatch = true;
        while (findMatch) {
          findMatch = false;

          const head = current[0];
          const tail = current[current.length - 1];

          for (let j = i + 1; j < paths.length; j++) {
            const other = paths[j];
            if (!other) continue;

            const otherHead = other[0];
            const otherTail = other[other.length - 1];

            // 1. Current tail -> Other head
            if (tail.distanceTo(otherHead) < epsilon) {
              current = current.concat(other.slice(1));
              paths[j] = null;
              findMatch = true;
              merged = true;
            }
            // 2. Current tail -> Other tail (reverse other)
            else if (tail.distanceTo(otherTail) < epsilon) {
              current = current.concat(other.slice(0, -1).reverse());
              paths[j] = null;
              findMatch = true;
              merged = true;
            }
            // 3. Current head -> Other tail
            else if (head.distanceTo(otherTail) < epsilon) {
              current = other.concat(current.slice(1));
              paths[j] = null;
              findMatch = true;
              merged = true;
            }
            // 4. Current head -> Other head
            else if (head.distanceTo(otherHead) < epsilon) {
              current = other.slice(1).reverse().concat(current);
              paths[j] = null;
              findMatch = true;
              merged = true;
            }

            if (findMatch) break;
          }
        }
        nextPaths.push(current);
      }

      paths = nextPaths.filter(Boolean);
    }

    return paths;
  }
}
