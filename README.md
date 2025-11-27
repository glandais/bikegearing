# BikeGearing - Advanced Bicycle Chain & Gear Simulation

An interactive web-based bicycle drivetrain simulator that accurately models chain physics, gear engagement, and realistic chain dynamics including catenary curves for the slack portion.

**Live Demo**: [https://glandais.github.io/bikegearing/](https://glandais.github.io/bikegearing/)

## Features

### Core Simulation
- **Realistic Chain Physics**: Individual chain rivets with accurate positioning and movement
- **Catenary Curve Modeling**: Bottom (slack) chain portion follows mathematically correct catenary curves
- **Chain Wear Simulation**: Models chain stretch from 0% to 2% elongation
- **Variable Speed Control**: -120 to +120 RPM (negative for reverse pedaling)
- **Dynamic Chain Tension**: Automatic chain tension calculations with visual feedback
- **Skid Patch Calculation**: Shows single-legged and ambidextrous skid patches for fixed-gear setups

### Interactive Controls
- **Pan & Zoom**: Mouse drag to pan, scroll wheel to zoom (touch gestures supported)
- **Adjustable Parameters**:
  - Chainring teeth: 32-60 teeth
  - Sprocket teeth: 10-25 teeth
  - Chainstay length: 380-430mm (with 1/100mm fine adjustment)
  - Chain links: 80-130 links (half-link chains supported)
  - Simulation speed: 0-200% speed multiplier
  - Chain wear: 0-2% elongation

### Visual Features
- **Debug Mode**: Shows internal calculations, rivet numbers, and performance metrics
- **Follow Rivet Mode**: Camera tracks rivet #0 through its journey
- **Optional Wheel Rendering**: Toggle rear wheel with spokes visualization
- **Chain Status Indicators**: Color-coded tension visualization (green=normal, red/yellow=over/under)
- **Real-time Metrics**: Speed (km/h), cadence (RPM), FPS counter

### Chainring Finder

An advanced tool for finding optimal chainring, chain, and cog combinations for fixed-gear setups.

**Access**: Click the "Chainring Finder" button in the sidebar to open the modal dialog.

#### Input Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| Chainstay min/max | 381-396mm | Target frame chainstay distance range |
| Ratio min/max | 2.6-3.4 | Target gear ratio range (chainring ÷ cog) |
| Cog min/max | 13-19 teeth | Sprocket teeth range to search |
| Chainring min/max | 42-55 teeth | Front gear teeth range to search |
| Chain links min/max | 80-130 links | Chain length range to consider |
| Half-link chain | Off | Enable to include odd link counts |
| Max wear | 0.75% | Maximum chain wear tolerance |
| Chainring count | 1-3 | Number of chainrings to combine |

#### Algorithm

The finder uses the following approach:

1. **Chainstay Calculation**: For each chainring/cog/chain combination, calculates the required chainstay distance using a quadratic formula:
   ```
   aD² + bD + c = 0
   ```
   Where D is chainstay distance, and coefficients depend on gear radii and chain length.

2. **Filtering**: Combinations are filtered by:
   - Chainstay within specified range (including worst-case worn chain)
   - Ratio within target range

3. **Scoring**: Each valid combination uses a weighted multi-factor score:
   ```
   score = coverage × (0.35 + 0.30 × countScore + 0.20 × evennessScore + 0.15 × reusabilityScore)
   ```

   | Factor | Weight | Description |
   |--------|--------|-------------|
   | Coverage | 35% | How much of target ratio range is achieved |
   | Count | 30% | Number of available ratios (logarithmic, max ~15) |
   | Evenness | 20% | How uniformly spaced ratios are (RMSE-based) |
   | Reusability | 15% | Cog sharing across multiple chainrings |

4. **Results**: Top 100 combinations returned, sorted by score descending.

#### Output

Results are displayed in an expandable table:

- **Main rows**: Show chainring teeth + chain link count + score breakdown
- **Expanded rows**: Show all valid cog options for that combo
  - Green highlight: Ratio within target range
  - Gray: Outside target range but valid chainstay
  - Displays: cog teeth, gear ratio, required chainstay, max chainstay at worn chain, skid patches

#### Usage

1. Set your frame's chainstay range and desired gear ratio
2. Adjust component ranges based on available parts
3. Select chainring count (1-3 for multi-chainring setups)
4. Click "Search" (or press Enter)
5. Expand rows to see cog options
6. Click any cog row to apply that configuration to the main simulation

## Technical Implementation

### Architecture Overview

The application uses TypeScript with ES6 modules and HTML5 Canvas for rendering. Built with Vite for development and bundling.

#### Core Modules

1. **State Management** (`ts/state.ts`)
   - Central state container for all simulation parameters
   - Tracks gear angles, rivet positions, chain engagement points
   - Manages derived values (radius, tooth angles, chain tension)
   - Automatic skid patch recalculation on gear changes

2. **Type Definitions** (`ts/types.ts`)
   - TypeScript interfaces for all data structures
   - FinderInputs, ValidCog, ChainringCombo, ChainringsCombo
   - Ensures type safety across the application

3. **Physics Engine** (`ts/computer.ts`)
   - Iterative constraint satisfaction algorithm (max 50 iterations)
   - Incremental angle updates with collision detection
   - Chain tension algorithms for upper and lower spans
   - Automatic rivet-to-cog engagement correction
   - Four constraints per iteration: tension up/down, front/rear rivet positioning

4. **Rivet Calculator** (`ts/rivet_calculator.ts`)
   - Calculates positions for all chain rivets
   - Manages four chain sections:
     - Front gear engaged rivets
     - Upper chain span (catenary)
     - Rear gear engaged rivets
     - Lower chain span (catenary)

5. **Catenary Mathematics** (`ts/catenary.ts`)
   - Implements exact catenary curve equation: `y = a * cosh((x - b) / a) + c`
   - Based on [mathematical solution](https://math.stackexchange.com/a/3557768)
   - Newton-Raphson method for parameter solving
   - Adaptive point distribution for smooth curves

6. **Rendering System** (`ts/drawer.ts` + specialized drawers)
   - **CogsDrawer**: Renders gear teeth with Bézier curve profiles
   - **RivetsDrawer**: Individual rivet rendering with color-coded tension
   - **WheelDrawer**: Rear wheel with realistic spoke patterns

7. **User Interface** (`ts/ui.ts`, `ts/ui_input.ts`)
   - Draggable sidebar with collapsible controls
   - Real-time parameter updates without simulation restart
   - Value converters for user-friendly display (%, mm, RPM)
   - Responsive layout with mobile support

8. **Interaction Handler** (`ts/interactive.ts`)
   - Pan/zoom camera controls
   - Touch gesture support (pinch zoom, drag)
   - Coordinate transformation (world ↔ screen space)

9. **Chainring Finder** (`ts/ratio_finder.ts`, `ts/ratio_finder_ui.ts`)
   - Algorithm for finding optimal gear combinations
   - Quadratic solver for chainstay distance calculation
   - Multi-factor weighted scoring system
   - Modal UI with expandable results table
   - Direct integration with main simulation state

### Mathematical Models

#### Chain Link Standard
- Standard pitch: 12.7mm (1/2 inch)
- Chain wear formula: `link_length = 12.7 * (1 + wear_percentage/100)`
- Total chain length: `links * link_length`

#### Gear Geometry
- Tooth angle: `2π / tooth_count`
- Engagement radius: Calculated from standard tooth profiles
- Angular velocity transfer: `ω_rear = ω_front * (teeth_front / teeth_rear)`

#### Catenary Curve
The slack chain follows the catenary equation:
```
y = a * cosh((x - b) / a) + c
```
Where parameters a, b, c are solved to satisfy:
- Fixed endpoints (gear tangent points)
- Total chain length constraint
- Gravity direction (always downward)

#### Chain Tension Algorithm
1. Calculate maximum straight-line distance between engagement points
2. If current distance exceeds maximum:
   - Find intersection of possible rivet positions
   - Adjust rear gear angle to maintain tension
3. Validate all rivets remain within gear tooth constraints

### Physics Constants

| Constant | Value | Description |
|----------|-------|-------------|
| HALF_LINK | 12.7mm | Standard chain pitch |
| MAX_ITERATIONS | 50 | Constraint solver limit |
| ANGLE_STEP | 0.01 rad | Per-iteration increment |
| ANGLE_TOLERANCE | 1e-8 | Convergence threshold |
| COLLISION_TOLERANCE | 0.001 | Teeth engagement tolerance |
| CATENARY_POINTS | 100 | Slack chain resolution |
| CATENARY_TOLERANCE | 1e-7 | Newton-Raphson convergence |

### Performance Optimizations

- **Incremental Updates**: Small angle steps (0.01 rad) prevent instability
- **Lazy Evaluation**: Rivets only recalculated when state changes
- **Canvas Optimization**: Single path for multiple elements when possible
- **Modulo Arithmetic**: Angles and indices wrapped to prevent overflow
- **Collision Batching**: All four engagement points checked per iteration

### Browser Compatibility

- **Required**: ES6 modules, Canvas API, RequestAnimationFrame
- **Tested**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: Full touch support on iOS/Android

## Development

### Setup
```bash
# Clone repository
git clone https://github.com/glandais/bikegearing.git
cd bikegearing

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Open http://localhost:5173
```

### Available Scripts
```bash
npm run dev        # Start Vite dev server
npm run build      # Type check + production build
npm run preview    # Preview production build
npm run typecheck  # TypeScript type checking only
```

### Code Style
- 2 spaces indentation (configured in `.prettierrc`)
- TypeScript with strict type checking
- ES6 module imports/exports
- No runtime dependencies

### File Structure
```
bikegearing/
├── index.html           # Main HTML with control panel
├── package.json         # npm configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── css/
│   └── main.css         # Sidebar and canvas styles
├── ts/
│   ├── init.ts          # Entry point and initialization
│   ├── main.ts          # Main application controller
│   ├── state.ts         # Central state management
│   ├── types.ts         # TypeScript interfaces
│   ├── computer.ts      # Physics calculations
│   ├── rivet_calculator.ts  # Rivet position calculations
│   ├── catenary.ts      # Catenary curve mathematics
│   ├── drawer.ts        # Main rendering controller
│   ├── cogs_drawer.ts   # Gear teeth rendering
│   ├── rivet_drawer.ts  # Chain rivet rendering
│   ├── wheel_drawer.ts  # Wheel and spokes rendering
│   ├── interactive.ts   # Mouse/touch interactions
│   ├── ui.ts            # UI control management
│   ├── ui_input.ts      # Input element handlers
│   ├── ratio_finder.ts  # Chainring/cog finder algorithm
│   ├── ratio_finder_ui.ts  # Finder modal UI
│   ├── math.ts          # Geometry utilities
│   └── constants.ts     # Physical constants
└── drawings/            # Reference images (unused in app)
```

## Physics Details

### Chain Engagement Rules
1. **Entry Constraint**: Rivet must align with tooth valley when engaging
2. **Exit Constraint**: Rivet follows tooth tip tangent when disengaging
3. **Tension Priority**: Upper chain (when pedaling forward) maintains tension
4. **Slack Calculation**: Lower chain forms natural catenary between tangent points

### Edge Cases Handled
- **Too Short Chain**: Marked red, simulation continues with impossible stretch
- **Too Long Chain**: Bottom sag increases, may skip on sprocket
- **Zero Speed**: Static equilibrium maintained
- **Reverse Pedaling**: Tension switches to lower chain
- **Extreme Ratios**: Stable from 1:2 to 3:1 gear ratios

### Known Limitations
- No elastic deformation (chain is rigid between pivots)
- No derailleur simulation (single-speed only)
- No frame flex or bearing play
- Simplified tooth profiles (not true involute)
- No mud/dirt friction effects
- Chain assumes perfect circles at gear engagement

## Performance Metrics

- **Computation**: ~0.5-2ms per frame (60 FPS capable)
- **Rendering**: ~1-3ms per frame (hardware dependent)
- **Memory**: ~5MB JavaScript heap usage
- **Iterations**: 10-50 physics iterations per frame (self-stabilizing)

## Mathematical References

- **Catenary Solution**: [Stack Exchange Answer](https://math.stackexchange.com/a/3557768)
- **Bicycle Physics**: Standard bicycle geometry and drivetrain mechanics
- **Chain Standards**: ISO 606 / ANSI B29.1 roller chain specifications

## Future Improvements

- Multiple chainrings/cassettes (derailleur systems)
- Chain elasticity and dynamic oscillation
- Rider power input replacing RPM control
- Chain line deviation (cross-chaining effects)
- Lubrication and efficiency calculations
- Export telemetry data
- VR/AR visualization modes
- Multi-speed internal hub gears
- Belt drive simulation
- Chainring Finder presets for common frame geometries

## Credits

- **Author**: Gabriel Landais (GLA)
- **Inspiration**: N-Peloton cycling group
- **Chain Brand**: "GLA" Easter egg in rivet rendering

## License

This project is open source. See repository for license details.

---

*Note: Setting chain length to 406.2mm instead of 406.0mm creates realistic bottom chain oscillation - just like after a rushed roadside repair!*
