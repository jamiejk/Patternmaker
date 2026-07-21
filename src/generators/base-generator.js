/**
 * Base Pattern Generator Interface
 * All pattern generators (Islamic, Japanese, Arts & Crafts) implement this class.
 */

export class BaseGenerator {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * Return default configuration parameters for the generator
   */
  getDefaultConfig() {
    return {};
  }

  /**
   * Generate vector lines for a given set of tiles
   * @param {Tile[]} tiles
   * @param {object} config - Generator specific parameter values
   * @param {object} penProfile - Selected pen profile object
   * @param {object} paperBounds - Paper dimensions and margins
   * @returns {Array<{ id: string, name: string, color: string, penNibMm: number, polylines: Vector2D[][] }>} Layers
   */
  generatePattern(tiles, config, penProfile, paperBounds) {
    throw new Error('generatePattern must be implemented by subclass');
  }
}
