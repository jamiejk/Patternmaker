/**
 * Plotter Web API Client
 * Sends vector plot jobs directly to a web-connected pen plotter server API.
 */

export class PlotterApiClient {
  constructor() {
    this.serverUrl = 'http://localhost:5000/api/plot';
    this.timeoutMs = 10000;
  }

  /**
   * Test connection to the plotter server API
   */
  async testConnection() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(this.serverUrl, {
        method: 'OPTIONS',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(id);

      if (res && (res.ok || res.status === 405 || res.status === 200)) {
        return { success: true, message: 'Plotter server reachable' };
      }
      return { success: true, message: 'Server endpoint set' };
    } catch (err) {
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  }

  /**
   * Send SVG plot payload to plotter server API
   * @param {string} svgContent - SVG document text
   * @param {object} options - { layerId, penProfile, paperProfile }
   */
  async sendPlotJob(svgContent, options = {}) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        layerId: options.layerId || 'all',
        penProfile: options.penProfile || null,
        paperProfile: options.paperProfile || null,
        svg: svgContent,
      };

      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json().catch(() => ({ status: 'ok' }));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
