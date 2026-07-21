/**
 * Pen & Nib Profile Management
 * Includes Staedtler Marsmatic 0.7mm preset and pen-material hatch spacing calculation
 */

export const PRESET_PEN_PROFILES = [
  {
    id: 'staedtler-marsmatic-07',
    name: 'Staedtler Marsmatic ISO 0.7mm',
    nibDiameterMm: 0.7,
    color: '#1e88e5', // Royal Blue
    layerName: 'Pen #1 (0.7mm Blue)',
  },
  {
    id: 'staedtler-marsmatic-035',
    name: 'Staedtler Marsmatic ISO 0.35mm',
    nibDiameterMm: 0.35,
    color: '#e53935', // Crimson
    layerName: 'Pen #2 (0.35mm Red)',
  },
  {
    id: 'rotring-isograph-05',
    name: 'rOtring Isograph 0.5mm',
    nibDiameterMm: 0.5,
    color: '#43a047', // Forest Green
    layerName: 'Pen #3 (0.5mm Green)',
  },
  {
    id: 'sakura-pigma-01',
    name: 'Sakura Pigma Micron 0.25mm (01)',
    nibDiameterMm: 0.25,
    color: '#8e24aa', // Violet
    layerName: 'Pen #4 (0.25mm Violet)',
  },
  {
    id: 'custom-pen',
    name: 'Custom Pen Profile...',
    nibDiameterMm: 0.7,
    color: '#000000',
    layerName: 'Pen Custom',
  },
];

export class PenProfileManager {
  constructor() {
    this.activePenId = 'staedtler-marsmatic-07';
    this.customNibMm = 0.7;
    this.overlapFactor = 1.0; // 1.0 = adjacent strokes touch exactly, 1.2 = slight gap, 0.8 = 20% overlap
  }

  getActivePen() {
    let preset = PRESET_PEN_PROFILES.find((p) => p.id === this.activePenId);
    if (!preset || this.activePenId === 'custom-pen') {
      return {
        id: 'custom-pen',
        name: `Custom (${this.customNibMm}mm)`,
        nibDiameterMm: this.customNibMm,
        color: '#000000',
        layerName: `Pen (${this.customNibMm}mm)`,
      };
    }
    return preset;
  }

  /**
   * Calculate hatch line spacing based on nib diameter and overlap factor
   * @returns {number} Spacing in millimeters between adjacent hatch lines
   */
  getHatchSpacingMm() {
    const pen = this.getActivePen();
    const spacing = pen.nibDiameterMm * this.overlapFactor;
    return Math.max(0.1, spacing);
  }
}
