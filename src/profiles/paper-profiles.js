/**
 * Paper Size & Profile Management
 * Standard sizes in millimeters (mm)
 */

export const STANDARD_PAPER_SIZES = [
  { id: 'A4', name: 'A4 (210 × 297 mm)', width: 210, height: 297, unit: 'mm' },
  { id: 'A3', name: 'A3 (297 × 420 mm)', width: 297, height: 420, unit: 'mm' },
  { id: 'A2', name: 'A2 (420 × 594 mm)', width: 420, height: 594, unit: 'mm' },
  { id: 'A5', name: 'A5 (148 × 210 mm)', width: 148, height: 210, unit: 'mm' },
  { id: 'LETTER', name: 'US Letter (8.5 × 11 in / 215.9 × 279.4 mm)', width: 215.9, height: 279.4, unit: 'mm' },
  { id: 'TABLOID', name: 'Tabloid (11 × 17 in / 279.4 × 431.8 mm)', width: 279.4, height: 431.8, unit: 'mm' },
  { id: 'CUSTOM', name: 'Custom Dimensions...', width: 200, height: 200, unit: 'mm' },
];

export class PaperProfileManager {
  constructor() {
    this.currentPresetId = 'A4';
    this.orientation = 'portrait'; // 'portrait' | 'landscape'
    this.customWidth = 200;
    this.customHeight = 200;
    this.marginMm = 15; // default margin
  }

  getDimensions() {
    let preset = STANDARD_PAPER_SIZES.find((p) => p.id === this.currentPresetId);
    let w = preset ? preset.width : this.customWidth;
    let h = preset ? preset.height : this.customHeight;

    if (this.currentPresetId === 'CUSTOM') {
      w = this.customWidth;
      h = this.customHeight;
    }

    if (this.orientation === 'landscape') {
      return { width: Math.max(w, h), height: Math.min(w, h), margin: this.marginMm };
    }
    return { width: Math.min(w, h), height: Math.max(w, h), margin: this.marginMm };
  }

  getPrintableBounds() {
    const { width, height, margin } = this.getDimensions();
    return {
      left: margin,
      top: margin,
      right: width - margin,
      bottom: height - margin,
      printableWidth: Math.max(0, width - 2 * margin),
      printableHeight: Math.max(0, height - 2 * margin),
      centerX: width / 2,
      centerY: height / 2,
    };
  }
}
