# Tiled Pattern Maker & Pen Plotter Engine

A modern web application for generating tiled geometric patterns, optimizing vector paths, grouping multi-pen layers, and exporting layered SVGs or sending them directly to a pen plotter server API.

![Tiled Pattern Maker](assets/preview.png)

## Background & Attribution

This project is inspired by [ChortleMortal/TiledPatternMaker](https://github.com/ChortleMortal/TiledPatternMaker), a C++/Qt application that ports Craig Kaplan's seminal **Taprats** software. Taprats implements E.H. Hankin's **"Polygons in Contact" (PIC)** construction method and A.J. Lee's geometric algorithms for Islamic and Andalusian star patterns and rosettes.

This web application translates those mathematical principles into a lightweight, client-side web engine tailored specifically for **pen plotters** (e.g., AxiDraw, iDraw, HP-GL/G-code plotters, and custom HTTP API plotter servers).

---

## Key Features

### 1. Paper & Pen Material Profiles
- **Paper Presets**: Standard sizes (**A5, A4, A3, A2, US Letter, Tabloid**) and **Custom Dimensions** in millimeters.
- **Orientation & Margins**: Live viewport rendering of physical paper sheets and printable margins.
- **Pen & Nib Profiles**: Preset for **Staedtler Marsmatic ISO 0.7mm**, 0.35mm, 0.5mm, 0.25mm, and Custom pen nib diameters.
- **Material Hatch Spacing**: Automatic hatch step calculation based on pen nib diameter and overlap ratio (`Hatch Step = Nib Diameter * Overlap`).

### 2. Geometry Engine & Hankin Star Generator
- **Archimedean & Regular Tilings**:
  - `4.8.8` (Octagonal & Square)
  - `4.4` (Square Grid)
  - `6.6.6` (Hexagonal Grid)
  - `3.12.12` (Dodecagonal & Triangular)
  - `3.6.3.6` (Kagome Star Grid)
- **Hankin Construction Parameters**: Interactive Contact Position ($\delta$), Contact Angle ($\theta$), tile scaling, and optional rosette hatch shading.

### 3. Pen Plotter Path Optimization Pipeline
- **Line Deduplication**: Removes overlapping coincident tile edges so the plotter pen doesn't double-ink paths.
- **Polyline Endpoint Joiner**: Chains matching segment endpoints into continuous polylines to minimize pen lifts.
- **TSP Path Sorter**: Nearest-neighbor path sorting to minimize pen-up travel distance across the paper bed.

### 4. Layered SVG Exporter & Web API Integration
- **Layered SVG Exporter**: Export grouped SVG files (`<g id="star-motif" stroke="#1e88e5">`) with physical millimeter dimensions (`width="210mm" height="297mm"`).
- **Plotter Server Web API**: One-click REST API (`POST`) payload dispatch to local or remote plotter servers.

---

## Project Structure

```
├── index.html                   # Main UI layout
├── style.css                    # Modern dark mode design system
├── src/
│   ├── app.js                   # Application coordinator & event bindings
│   ├── geometry/
│   │   ├── vector.js            # 2D vector & ray math utilities
│   │   └── tiling.js            # Regular & Archimedean tiling grid engine
│   ├── profiles/
│   │   ├── paper-profiles.js    # Paper preset & custom size manager
│   │   └── pen-profiles.js      # Pen profiles & hatch spacing math
│   ├── generators/
│   │   ├── base-generator.js    # Abstract generator plugin interface
│   │   └── islamic-hankin.js    # Islamic Hankin star & rosette generator
│   └── plotter/
│       ├── deduplicator.js      # Coincident line deduplicator
│       ├── polyline-joiner.js   # Endpoint polyline joiner
│       ├── path-sorter.js       # TSP travel distance optimizer
│       ├── svg-exporter.js      # Multi-pen SVG exporter
│       └── plotter-api.js       # Plotter server REST API client
└── README.md
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/jamiejk/Patternmaker.git
   cd Patternmaker
   ```
2. Serve locally with any static web server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Or using Node.js / npx
   npx serve ./
   ```
3. Open `http://localhost:8080` in your browser.

---

## Roadmap & TODO List

Below is a detailed list of features remaining to port from `TiledPatternMaker` / Taprats, as well as pen plotter specific enhancements:

### 1. Advanced Tilings & Grid Topologies (Taprats Porting)
- [ ] **Dual Tilings**: Port dual grid generators (Dual of 4.8.8, Dual of 3.12.12, Dual of 6.6.6).
- [ ] **Non-Regular & Irregular Tilings**: Pentagonal tilings (Cairo tiling), kite/dart Penrose tilings.
- [ ] **Custom Tile Symmetry Groups**: Implement $p1, p2, p4, p4m, p6, p6m$ wallpaper groups for custom tile placement.
- [ ] **Interactive Tile Editor**: Allow custom polygon creation and edge vertex manipulation.

### 2. Hankin Motif & Geometry Variations (Taprats Porting)
- [ ] **Multi-Contact Point Hankin (Lee's 2-Point Method)**: Support multiple contact points per polygon edge for complex 12-point and 16-point rosettes.
- [ ] **Asymmetric Contact Angles**: Allow $\theta_1 \neq \theta_2$ for elongated star rays.
- [ ] **3D Interlacing / Ribbon Over-Under Render Mode**: Generate double-line woven ribbons with under/over gaps for pen plotting.
- [ ] **Historic Motif Preset Library**: Presets inspired by classic patterns from the Alhambra (Granada), Cordoba Mosque, Samarkand, and Fes.
- [ ] **Custom Crop Boundaries**: Clip geometric mosaics inside circles, Gothic arches, star shields, or custom SVG paths.
- [ ] **Border Generators**: Add outer geometric border frames and corner motifs.

### 3. Future Pattern Generator Plugins
- [ ] **Japanese Generator Module**:
  - *Asanoha* (hemp leaf)
  - *Seigaiha* (ocean waves)
  - *Shippo* (seven treasures)
  - *Sayagata* (swastika key fret)
- [ ] **Arts & Crafts Generator Module**:
  - William Morris inspired interlocking floral/vine curves
  - Mackintosh geometric grid structures
  - Gothic tracery arches

### 4. Advanced Pen Plotter Features
- [ ] **Direct Web Serial API Integration**: Connect directly to GRBL, Marlin, or AxiDraw plotters over USB serial from the browser.
- [ ] **G-code & HP-GL Exporter**: Alternative vector exporter for CNC/HP-GL plotters.
- [ ] **Multi-Pen Plot Simulator**: Animated stroke order preview showing pen motion and pen-up travel paths before plotting.
- [ ] **Pen Nib Offset / Double Outline Path Expansion**: Automatically offset paths by pen nib radius for thick markers and brushes.

---

## License

MIT License. Free to use, extend, and adapt for pen plotting and generative vector art.
