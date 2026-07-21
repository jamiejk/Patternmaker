/**
 * Main Application Coordinator
 * Binds UI controls, geometry engine, optimizer, SVG viewport, and Plotter API client.
 */

import { PaperProfileManager } from './profiles/paper-profiles.js';
import { PenProfileManager } from './profiles/pen-profiles.js';
import { TilingEngine } from './geometry/tiling.js';
import { IslamicHankinGenerator } from './generators/islamic-hankin.js';
import { LineDeduplicator } from './plotter/deduplicator.js';
import { PolylineJoiner } from './plotter/polyline-joiner.js';
import { PathSorter } from './plotter/path-sorter.js';
import { SVGExporter } from './plotter/svg-exporter.js';
import { PlotterApiClient } from './plotter/plotter-api.js';
import { Vector2D } from './geometry/vector.js';

class PatternMakerApp {
  constructor() {
    this.paperManager = new PaperProfileManager();
    this.penManager = new PenProfileManager();
    this.generator = new IslamicHankinGenerator();
    this.apiClient = new PlotterApiClient();

    // Viewport transform state
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    // Computed optimization cache
    this.currentProcessedLayers = [];
    this.totalTravelMm = 0;
    this.totalPolylinesCount = 0;

    this.initDOM();
    this.bindEvents();
    this.updateApp();
    this.fitPaperToViewport();
  }

  initDOM() {
    // Selectors
    this.elPaperPreset = document.getElementById('paper-preset');
    this.elPaperOrientation = document.getElementById('paper-orientation');
    this.elCustomPaperRow = document.getElementById('custom-paper-row');
    this.elCustomWidth = document.getElementById('custom-width');
    this.elCustomHeight = document.getElementById('custom-height');
    this.elPaperMargin = document.getElementById('paper-margin');
    this.valPaperMargin = document.getElementById('val-paper-margin');

    this.elPenPreset = document.getElementById('pen-preset');
    this.elCustomPenRow = document.getElementById('custom-pen-row');
    this.elCustomNibMm = document.getElementById('custom-nib-mm');

    this.elTilingType = document.getElementById('tiling-type');
    this.elTileScale = document.getElementById('tile-scale');
    this.valTileScale = document.getElementById('val-tile-scale');
    this.elHankinDelta = document.getElementById('hankin-delta');
    this.valHankinDelta = document.getElementById('val-hankin-delta');
    this.elHankinAngle = document.getElementById('hankin-angle');
    this.valHankinAngle = document.getElementById('val-hankin-angle');

    this.elEnableHatching = document.getElementById('enable-hatching');
    this.elHatchingControls = document.getElementById('hatching-controls');
    this.elHatchAngle = document.getElementById('hatch-angle');
    this.valHatchAngle = document.getElementById('val-hatch-angle');
    this.valHatchStep = document.getElementById('val-hatch-step');

    this.elPlotterUrl = document.getElementById('plotter-url');
    this.btnTestApi = document.getElementById('btn-test-api');
    this.apiStatusBadge = document.getElementById('api-status-badge');

    this.btnExportSvg = document.getElementById('btn-export-svg');
    this.btnSendPlotter = document.getElementById('btn-send-plotter');

    // Viewport DOM
    this.canvasContainer = document.getElementById('canvas-container');
    this.svgViewport = document.getElementById('svg-viewport');
    this.viewportTransform = document.getElementById('viewport-transform');
    this.svgPaperSheet = document.getElementById('svg-paper-sheet');
    this.svgPaperMargin = document.getElementById('svg-paper-margin');
    this.svgLayerRoot = document.getElementById('svg-layer-root');

    // Stats & Layers
    this.statPaper = document.getElementById('stat-paper');
    this.statPaths = document.getElementById('stat-paths');
    this.statTravel = document.getElementById('stat-travel');
    this.layerList = document.getElementById('layer-list');

    // Zoom Buttons
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
  }

  bindEvents() {
    // Paper Profile Events
    this.elPaperPreset.addEventListener('change', (e) => {
      this.paperManager.currentPresetId = e.target.value;
      if (e.target.value === 'CUSTOM') {
        this.elCustomPaperRow.classList.remove('hidden');
      } else {
        this.elCustomPaperRow.classList.add('hidden');
      }
      this.updateApp();
      this.fitPaperToViewport();
    });

    this.elPaperOrientation.addEventListener('change', (e) => {
      this.paperManager.orientation = e.target.value;
      this.updateApp();
      this.fitPaperToViewport();
    });

    this.elCustomWidth.addEventListener('input', (e) => {
      this.paperManager.customWidth = parseFloat(e.target.value) || 200;
      this.updateApp();
    });

    this.elCustomHeight.addEventListener('input', (e) => {
      this.paperManager.customHeight = parseFloat(e.target.value) || 200;
      this.updateApp();
    });

    this.elPaperMargin.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.paperManager.marginMm = val;
      this.valPaperMargin.textContent = val;
      this.updateApp();
    });

    // Pen Profile Events
    this.elPenPreset.addEventListener('change', (e) => {
      this.penManager.activePenId = e.target.value;
      if (e.target.value === 'custom-pen') {
        this.elCustomPenRow.classList.remove('hidden');
      } else {
        this.elCustomPenRow.classList.add('hidden');
      }
      this.updateHatchStepDisplay();
      this.updateApp();
    });

    this.elCustomNibMm.addEventListener('input', (e) => {
      this.penManager.customNibMm = parseFloat(e.target.value) || 0.7;
      this.updateHatchStepDisplay();
      this.updateApp();
    });

    // Geometry Controls
    this.elTilingType.addEventListener('change', () => this.updateApp());

    this.elTileScale.addEventListener('input', (e) => {
      this.valTileScale.textContent = e.target.value;
      this.updateApp();
    });

    this.elHankinDelta.addEventListener('input', (e) => {
      this.valHankinDelta.textContent = e.target.value;
      this.updateApp();
    });

    this.elHankinAngle.addEventListener('input', (e) => {
      this.valHankinAngle.textContent = e.target.value;
      this.updateApp();
    });

    // Hatching Controls
    this.elEnableHatching.addEventListener('change', (e) => {
      if (e.target.checked) {
        this.elHatchingControls.classList.remove('hidden');
      } else {
        this.elHatchingControls.classList.add('hidden');
      }
      this.updateApp();
    });

    this.elHatchAngle.addEventListener('input', (e) => {
      this.valHatchAngle.textContent = e.target.value;
      this.updateApp();
    });

    // Plotter Server API Events
    this.elPlotterUrl.addEventListener('input', (e) => {
      this.apiClient.serverUrl = e.target.value;
    });

    this.btnTestApi.addEventListener('click', async () => {
      this.apiStatusBadge.textContent = 'Testing connection...';
      this.apiStatusBadge.className = 'status-badge';
      const res = await this.apiClient.testConnection();
      this.apiStatusBadge.textContent = res.message;
      if (!res.success) {
        this.apiStatusBadge.classList.add('error');
      }
    });

    // Action Buttons
    this.btnExportSvg.addEventListener('click', () => this.exportSVG());
    this.btnSendPlotter.addEventListener('click', () => this.sendToPlotter());

    // Viewport Pan & Zoom Mouse Events
    this.canvasContainer.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStart.x;
      this.panY = e.clientY - this.dragStart.y;
      this.applyViewportTransform();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvasContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.min(Math.max(this.zoom * zoomFactor, 0.2), 5.0);
      this.applyViewportTransform();
    });

    // Zoom Buttons
    this.btnZoomIn.addEventListener('click', () => {
      this.zoom *= 1.2;
      this.applyViewportTransform();
    });
    this.btnZoomOut.addEventListener('click', () => {
      this.zoom /= 1.2;
      this.applyViewportTransform();
    });
    this.btnZoomReset.addEventListener('click', () => this.fitPaperToViewport());
  }

  updateHatchStepDisplay() {
    const spacing = this.penManager.getHatchSpacingMm();
    this.valHatchStep.textContent = spacing.toFixed(2);
  }

  fitPaperToViewport() {
    const dims = this.paperManager.getDimensions();
    const containerW = this.canvasContainer.clientWidth || 800;
    const containerH = this.canvasContainer.clientHeight || 600;

    const scaleX = (containerW * 0.8) / dims.width;
    const scaleY = (containerH * 0.8) / dims.height;

    this.zoom = Math.min(scaleX, scaleY);
    this.panX = (containerW - dims.width * this.zoom) / 2;
    this.panY = (containerH - dims.height * this.zoom) / 2;

    this.applyViewportTransform();
  }

  applyViewportTransform() {
    this.viewportTransform.setAttribute(
      'transform',
      `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`
    );
  }

  /**
   * Main Generation Pipeline
   */
  updateApp() {
    const dims = this.paperManager.getDimensions();
    const bounds = this.paperManager.getPrintableBounds();
    const activePen = this.penManager.getActivePen();

    // 1. Update Paper Viewport Rects
    this.svgPaperSheet.setAttribute('width', dims.width);
    this.svgPaperSheet.setAttribute('height', dims.height);

    this.svgPaperMargin.setAttribute('x', bounds.left);
    this.svgPaperMargin.setAttribute('y', bounds.top);
    this.svgPaperMargin.setAttribute('width', bounds.printableWidth);
    this.svgPaperMargin.setAttribute('height', bounds.printableHeight);

    // 2. Generate Tiling Grid
    const scaleMm = parseInt(this.elTileScale.value, 10);
    const tilingType = this.elTilingType.value;
    const tiles = TilingEngine.generateTiling(tilingType, scaleMm, bounds);

    // 3. Generator Parameters
    const config = {
      deltaPct: parseInt(this.elHankinDelta.value, 10),
      angleDeg: parseInt(this.elHankinAngle.value, 10),
      showGrid: true,
      enableHatching: this.elEnableHatching.checked,
      hatchAngleDeg: parseInt(this.elHatchAngle.value, 10),
    };

    // 4. Generate Raw Vector Layers
    const rawLayers = this.generator.generatePattern(tiles, config, activePen, bounds);

    // 5. Run Pen Plotter Optimization Pipeline per Layer
    this.currentProcessedLayers = [];
    this.totalTravelMm = 0;
    this.totalPolylinesCount = 0;

    for (const rawLayer of rawLayers) {
      // Step A: Deduplicate coincident segments
      const deduped = LineDeduplicator.deduplicate(rawLayer.polylines);
      // Step B: Join matching endpoints into continuous polylines
      const joined = PolylineJoiner.join(deduped);
      // Step C: TSP Path Sorter to minimize pen-up air distance
      const { sortedPolylines, travelDistanceMm } = PathSorter.sortNearestNeighbor(joined);

      this.totalTravelMm += travelDistanceMm;
      this.totalPolylinesCount += sortedPolylines.length;

      this.currentProcessedLayers.push({
        id: rawLayer.id,
        name: rawLayer.name,
        color: rawLayer.color,
        penNibMm: rawLayer.penNibMm,
        polylines: sortedPolylines,
      });
    }

    // 6. Render Viewport & Layer Manager UI
    this.renderSVGViewport();
    this.renderLayerSidebar();
    this.updateStatsDisplay(dims);
  }

  renderSVGViewport() {
    this.svgLayerRoot.innerHTML = '';

    for (const layer of this.currentProcessedLayers) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', layer.id);
      g.setAttribute('stroke', layer.color);
      g.setAttribute('stroke-width', layer.penNibMm || 0.7);
      g.setAttribute('fill', 'none');
      g.setAttribute('stroke-linecap', 'round');
      g.setAttribute('stroke-linejoin', 'round');

      for (const poly of layer.polylines) {
        if (poly.length < 2) continue;
        let d = `M ${poly[0].x.toFixed(2)},${poly[0].y.toFixed(2)}`;
        for (let i = 1; i < poly.length; i++) {
          d += ` L ${poly[i].x.toFixed(2)},${poly[i].y.toFixed(2)}`;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        g.appendChild(path);
      }

      this.svgLayerRoot.appendChild(g);
    }
  }

  renderLayerSidebar() {
    this.layerList.innerHTML = '';

    for (const layer of this.currentProcessedLayers) {
      const card = document.createElement('div');
      card.className = 'layer-card';

      card.innerHTML = `
        <div class="layer-color-dot" style="background-color: ${layer.color};"></div>
        <div class="layer-info">
          <span class="layer-title">${layer.name}</span>
          <span class="layer-meta">Nib: ${layer.penNibMm}mm | Polylines: ${layer.polylines.length}</span>
        </div>
      `;

      this.layerList.appendChild(card);
    }
  }

  updateStatsDisplay(dims) {
    const presetObj = this.paperManager.getDimensions();
    this.statPaper.textContent = `Paper: ${dims.width}×${dims.height}mm`;
    this.statPaths.textContent = `Polylines: ${this.totalPolylinesCount}`;
    this.statTravel.textContent = `Air Travel: ${(this.totalTravelMm / 10).toFixed(1)} cm`;
  }

  exportSVG() {
    const dims = this.paperManager.getDimensions();
    const svgText = SVGExporter.exportSVG(this.currentProcessedLayers, dims);
    const filename = `pattern_${dims.width}x${dims.height}mm_${Date.now()}.svg`;
    SVGExporter.downloadFile(filename, svgText);
  }

  async sendToPlotter() {
    const dims = this.paperManager.getDimensions();
    const svgText = SVGExporter.exportSVG(this.currentProcessedLayers, dims);

    this.apiStatusBadge.textContent = 'Sending plot job...';
    this.apiStatusBadge.className = 'status-badge';

    const result = await this.apiClient.sendPlotJob(svgText, {
      layerId: 'all',
      penProfile: this.penManager.getActivePen(),
      paperProfile: dims,
    });

    if (result.success) {
      this.apiStatusBadge.textContent = 'Job sent successfully!';
    } else {
      this.apiStatusBadge.textContent = `Failed: ${result.error}`;
      this.apiStatusBadge.classList.add('error');
    }
  }
}

// Initialize App on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PatternMakerApp();
});
