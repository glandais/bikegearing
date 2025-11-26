# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bicycle gear and chain simulation web application that visualizes chain movement through different gear configurations. Built with vanilla JavaScript and HTML5 Canvas, it simulates realistic chain physics including catenary curves for the slack chain portion.

## Architecture

### Core Components

- **initBikeGearing** (`js/init.js`): Application entry point, initializes State → Main → UI in correct dependency order
- **BikeGearingMain** (`js/main.js`): Main application controller, manages animation loop and coordinates between components
- **BikeGearingState** (`js/state.js`): Central state management for all simulation parameters (gear teeth, chain length, angles, skid patches)
- **BikeGearingComputer** (`js/computer.js`): Physics calculations for chain movement and gear rotation
- **BikeGearingRivetsCalculator** (`js/rivet_calculator.js`): Calculates individual chain rivet positions based on gear engagement
- **BikeGearingDrawer** (`js/drawer.js`): Canvas rendering of the entire simulation
- **BikeGearingInteractive** (`js/interactive.js`): Mouse/touch interaction handling for pan and zoom
- **BikeGearingUi** (`js/ui.js` + `js/ui_input.js`): UI controls and parameter inputs

### Foundation Modules

- **constants.js**: Physics constants (HALF_LINK = 12.7mm, iteration limits, tolerances)
- **math.js**: Geometry utilities (BikeGearingPoint, BikeGearingCircle, angle conversions, GCD for skid patches)

### Specialized Drawing Modules

- **cogs_drawer.js**: Renders chainring and sprocket teeth
- **rivet_drawer.js**: Renders individual chain rivets
- **wheel_drawer.js**: Renders the rear wheel with spokes
- **catenary.js**: Implements catenary curve calculations for the slack chain portion

### Chainring Finder

- **ratio_finder.js**: Algorithm to find optimal chainring/chain/cog combinations. Uses quadratic formula to calculate required chainstay distance for any gear combo. Scores results by ratio coverage and target range matching.
- **ratio_finder_ui.js**: Modal dialog UI for the finder. Supports parameter ranges (chainstay, ratio, cogs, chainring, chain links), half-link chains, and chain wear tolerance. Results are expandable rows; clicking a cog applies the configuration to the main simulation.

### Key Physics Concepts

- Chain is modeled as discrete rivets connected by links
- The bottom chain portion (slack) follows a catenary curve equation
- Gear teeth engagement is calculated precisely based on rivet positions
- Chain wear simulation affects link length (up to 2% elongation)

## Development Commands

This is a static web application with no build process required:

```bash
# Serve locally with any static server, e.g.:
python3 -m http.server 8000
# Then open http://localhost:8000

# Format code with Prettier (configuration in .prettierrc)
npx prettier --write "**/*.{js,html,css}"
```

## Code Style

- 2 spaces indentation (configured in .prettierrc)
- ES6 modules with explicit imports/exports
- JSDoc type annotations for better IDE support
- No external dependencies or frameworks

## Key Simulation Parameters

- **Chainring teeth (f)**: 32-60 teeth on front gear
- **Sprocket teeth (r)**: 10-25 teeth on rear gear
- **Chainstay length (cs)**: 380-430mm distance between gears (350-450mm in finder)
- **Chain links (cl)**: 80-130 links (each link = 12.7mm), supports half-link chains
- **Chain wear**: 0-2% elongation simulation
- **RPM**: -120 to 120 (negative for reverse)
- **Skid patches**: Automatically calculated for fixed-gear setups (single-leg and ambidextrous)