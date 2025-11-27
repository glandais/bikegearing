# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bicycle gear and chain simulation web application that visualizes chain movement through different gear configurations. Built with TypeScript and HTML5 Canvas, it simulates realistic chain physics including catenary curves for the slack chain portion.

## Architecture

### Core Components

- **initBikeGearing** (`ts/init.ts`): Application entry point, initializes State → Main → UI in correct dependency order
- **BikeGearingMain** (`ts/main.ts`): Main application controller, manages animation loop and coordinates between components
- **BikeGearingState** (`ts/state.ts`): Central state management for all simulation parameters (gear teeth, chain length, angles, skid patches)
- **BikeGearingComputer** (`ts/computer.ts`): Physics calculations for chain movement and gear rotation using iterative constraint satisfaction
- **BikeGearingRivetsCalculator** (`ts/rivet_calculator.ts`): Calculates individual chain rivet positions based on gear engagement
- **BikeGearingDrawer** (`ts/drawer.ts`): Canvas rendering orchestrator for the entire simulation
- **BikeGearingInteractive** (`ts/interactive.ts`): Mouse/touch interaction handling for pan, zoom, and pinch gestures
- **BikeGearingUi** (`ts/ui.ts` + `ts/ui_input.ts`): UI controls and parameter inputs with value converters

### Foundation Modules

- **types.ts**: TypeScript interfaces for all data structures (FinderInputs, ValidCog, ChainringCombo, etc.)
- **constants.ts**: Physics constants (HALF_LINK = 12.7mm, MAX_ITERATIONS, tolerances)
- **math.ts**: Geometry utilities (BikeGearingPoint, BikeGearingCircle, angle conversions, GCD for skid patches)

### Specialized Drawing Modules

- **cogs_drawer.ts**: Renders chainring and sprocket teeth using Bézier curves
- **rivet_drawer.ts**: Renders individual chain rivets with stretch visualization (color-coded tension)
- **wheel_drawer.ts**: Renders the rear wheel with spokes, hub, and brake zone
- **catenary.ts**: Implements catenary curve calculations using Newton-Raphson method

### Chainring Finder

- **ratio_finder.ts**: Algorithm to find optimal chainring/chain/cog combinations. Uses quadratic formula to calculate required chainstay distance. Multi-factor scoring system with weighted components.
- **ratio_finder_ui.ts**: Modal dialog UI for the finder. Supports parameter ranges, half-link chains, chain wear tolerance, and multiple chainring selection. Results are expandable rows; clicking a cog applies the configuration to the main simulation.

### Key Physics Concepts

- Chain is modeled as discrete rivets connected by links (12.7mm pitch)
- The bottom chain portion (slack) follows a catenary curve equation: `y = a * cosh((x - b) / a) + c`
- Gear teeth engagement calculated via iterative constraint satisfaction (max 50 iterations)
- Chain wear simulation affects link length (up to 2% elongation)
- Four constraints applied per iteration: chain tension up/down, front/rear cog rivet positioning

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Type check without emitting
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Style

- 2 spaces indentation (configured in .prettierrc)
- TypeScript with strict type checking
- ES6 modules with explicit imports/exports
- No external runtime dependencies (only dev dependencies: TypeScript, Vite)

## Key Simulation Parameters

- **Chainring teeth (f)**: 32-60 teeth on front gear
- **Sprocket teeth (r)**: 10-25 teeth on rear gear
- **Chainstay length (cs)**: 380-430mm distance between gears (350-450mm in finder)
- **Chain links (cl)**: 80-130 links (each link = 12.7mm), supports half-link chains
- **Chain wear**: 0-2% elongation simulation
- **RPM**: -120 to 120 (negative for reverse)
- **Skid patches**: Automatically calculated for fixed-gear setups (single-leg and ambidextrous)

## Physics Constants

| Constant | Value | Description |
|----------|-------|-------------|
| HALF_LINK | 12.7mm | Standard chain pitch (half of 25.4mm) |
| MAX_ITERATIONS | 50 | Prevent infinite loops in constraint solver |
| ANGLE_STEP | 0.01 rad | Per-iteration angle increment (~0.57°) |
| ANGLE_TOLERANCE | 0.00000001 | Convergence threshold |
| COLLISION_TOLERANCE | 0.001 | Teeth engagement tolerance |
| CATENARY_POINTS | 100 | Interpolation points for slack chain |

## Ratio Finder Scoring Algorithm

The finder uses a weighted multi-factor scoring system:

```
score = coverage × (0.35 + 0.30 × countScore + 0.20 × evennessScore + 0.15 × reusabilityScore)
```

- **Coverage (35%)**: How much of target ratio range is achieved
- **Count (30%)**: Number of available ratios (logarithmic, max 15 expected)
- **Evenness (20%)**: How uniformly spaced the ratios are (RMSE-based)
- **Reusability (15%)**: How many cogs are shared across chainrings
