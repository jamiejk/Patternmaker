/**
 * TSP Path Sorter for Pen Plotters
 * Sorts polylines using a greedy nearest-neighbor search to minimize pen-up travel distance.
 */

import { Vector2D } from '../geometry/vector.js';

export class PathSorter {
  /**
   * Sort polylines to minimize pen lift air time
   * @param {Array<Vector2D[]>} polylines
   * @param {Vector2D} startPos - Initial pen position (default 0,0)
   * @returns {{ sortedPolylines: Array<Vector2D[]>, travelDistanceMm: number }}
   */
  static sortNearestNeighbor(polylines, startPos = new Vector2D(0, 0)) {
    if (!polylines || polylines.length === 0) {
      return { sortedPolylines: [], travelDistanceMm: 0 };
    }

    const remaining = polylines.map((p) => [...p]);
    const sorted = [];
    let currentPenPos = startPos.clone();
    let totalTravel = 0;

    while (remaining.length > 0) {
      let bestIndex = -1;
      let bestDist = Infinity;
      let reverseBest = false;

      for (let i = 0; i < remaining.length; i++) {
        const poly = remaining[i];
        const head = poly[0];
        const tail = poly[poly.length - 1];

        const distHead = currentPenPos.distanceTo(head);
        const distTail = currentPenPos.distanceTo(tail);

        if (distHead < bestDist) {
          bestDist = distHead;
          bestIndex = i;
          reverseBest = false;
        }

        if (distTail < bestDist) {
          bestDist = distTail;
          bestIndex = i;
          reverseBest = true;
        }
      }

      if (bestIndex !== -1) {
        let chosen = remaining.splice(bestIndex, 1)[0];
        if (reverseBest) {
          chosen.reverse();
        }
        totalTravel += bestDist;
        sorted.push(chosen);
        currentPenPos = chosen[chosen.length - 1].clone();
      }
    }

    return { sortedPolylines: sorted, travelDistanceMm: totalTravel };
  }
}
