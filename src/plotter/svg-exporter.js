/**
 * Layered SVG Exporter for Pen Plotters
 * Exports vector layers into physical SVG files with grouped layers.
 */

export class SVGExporter {
  /**
   * Export layers to SVG XML string
   * @param {Array<{ id: string, name: string, color: string, penNibMm: number, polylines: Vector2D[][] }>} layers
   * @param {object} paperDimensions - { width, height, unit: 'mm' }
   * @returns {string} SVG Document String
   */
  static exportSVG(layers, paperDimensions) {
    const w = paperDimensions.width;
    const h = paperDimensions.height;

    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" `;
    svg += `width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">\n`;
    svg += `  <style>\n`;
    svg += `    path { fill: none; stroke-linecap: round; stroke-linejoin: round; }\n`;
    svg += `  </style>\n`;

    for (const layer of layers) {
      if (!layer.polylines || layer.polylines.length === 0) continue;

      const layerId = layer.id || 'layer';
      const color = layer.color || '#000000';
      const strokeWidth = layer.penNibMm || 0.7;

      svg += `  <g id="${layerId}" inkscape:groupmode="layer" inkscape:label="${layer.name}" stroke="${color}" stroke-width="${strokeWidth}">\n`;

      for (const poly of layer.polylines) {
        if (poly.length < 2) continue;

        let d = `M ${poly[0].x.toFixed(3)},${poly[0].y.toFixed(3)}`;
        for (let i = 1; i < poly.length; i++) {
          d += ` L ${poly[i].x.toFixed(3)},${poly[i].y.toFixed(3)}`;
        }

        svg += `    <path d="${d}" />\n`;
      }

      svg += `  </g>\n`;
    }

    svg += `</svg>`;
    return svg;
  }

  /**
   * Helper to trigger browser download of an SVG file
   */
  static downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
