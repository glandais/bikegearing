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
- **Chain Status Indicators**: Red coloring when chain is too short/long
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

3. **Scoring**: Each valid combination is scored:
   ```
   score = (ratios_in_range × 10) + (coverage × 5)
   ```
   - `ratios_in_range`: Number of cog options falling within target ratio
   - `coverage`: Ratio range coverage percentage

4. **Results**: Top 50 combinations returned, sorted by score descending.

#### Output

Results are displayed in an expandable table:

- **Main rows**: Show chainring teeth + chain link count + score
- **Expanded rows**: Show all valid cog options for that combo
  - Green highlight: Ratio within target range
  - Gray: Outside target range but valid
  - Displays: cog teeth, gear ratio, required chainstay, max chainstay at worn chain

#### Usage

1. Set your frame's chainstay range and desired gear ratio
2. Adjust component ranges based on available parts
3. Click "Search" (or press Enter)
4. Expand rows to see cog options
5. Click any cog row to apply that configuration to the main simulation

## Technical Implementation

### Architecture Overview

The application uses vanilla JavaScript with ES6 modules and HTML5 Canvas for rendering. No external dependencies or frameworks are required.

#### Core Modules

1. **State Management** (`state.js`)
   - Central state container for all simulation parameters
   - Tracks gear angles, rivet positions, chain engagement points
   - Manages derived values (radius, tooth angles, chain tension)

2. **Physics Engine** (`computer.js`)
   - Main computation loop running at 60 FPS
   - Incremental angle updates with collision detection
   - Chain tension algorithms for upper and lower spans
   - Automatic rivet-to-cog engagement correction

3. **Rivet Calculator** (`rivet_calculator.js`)
   - Calculates positions for all chain rivets
   - Manages four chain sections:
     - Front gear engaged rivets
     - Upper chain span (catenary)
     - Rear gear engaged rivets
     - Lower chain span (catenary)

4. **Catenary Mathematics** (`catenary.js`)
   - Implements exact catenary curve equation
   - Based on [mathematical solution](https://math.stackexchange.com/a/3557768)
   - Newton-Raphson method for parameter solving
   - Adaptive point distribution for smooth curves

5. **Rendering System** (`drawer.js` + specialized drawers)
   - **CogsDrawer**: Renders gear teeth with accurate involute profiles
   - **RivetsDrawer**: Individual rivet rendering with chain links
   - **WheelDrawer**: Rear wheel with realistic spoke patterns

6. **User Interface** (`ui.js`, `ui_input.js`)
   - Draggable sidebar with collapsible controls
   - Real-time parameter updates without simulation restart
   - Responsive layout with mobile support

7. **Interaction Handler** (`interactive.js`)
   - Pan/zoom camera controls
   - Touch gesture support (pinch zoom, drag)
   - Coordinate transformation (world ↔ screen space)

8. **Chainring Finder** (`ratio_finder.js`, `ratio_finder_ui.js`)
   - Algorithm for finding optimal gear combinations
   - Quadratic solver for chainstay distance calculation
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

# Serve with any static server
python3 -m http.server 8000
# Or
npx serve

# Open http://localhost:8000
```

### Code Style
- 2 spaces indentation (configured in `.prettierrc`)
- JSDoc annotations for type hints
- ES6 module imports/exports
- No transpilation required

### File Structure
```
bikegearing/
├── index.html           # Main HTML with control panel
├── css/
│   └── main.css        # Sidebar and canvas styles
├── js/
│   ├── init.js         # Entry point and initialization
│   ├── main.js         # Main application controller
│   ├── state.js        # Central state management
│   ├── computer.js     # Physics calculations
│   ├── rivet_calculator.js  # Rivet position calculations
│   ├── catenary.js     # Catenary curve mathematics
│   ├── drawer.js       # Main rendering controller
│   ├── cogs_drawer.js  # Gear teeth rendering
│   ├── rivet_drawer.js # Chain rivet rendering
│   ├── wheel_drawer.js # Wheel and spokes rendering
│   ├── interactive.js  # Mouse/touch interactions
│   ├── ui.js           # UI control management
│   ├── ui_input.js     # Input element handlers
│   ├── ratio_finder.js # Chainring/cog combination finder algorithm
│   ├── ratio_finder_ui.js  # Finder modal UI
│   ├── math.js         # Geometry utilities
│   └── constants.js    # Physical constants
└── drawings/           # Reference images (unused in app)
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