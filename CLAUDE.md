# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bicycle gear and chain simulation web application that visualizes chain movement through different gear configurations. Built with vanilla JavaScript and HTML5 Canvas, it simulates realistic chain physics including catenary curves for the slack chain portion.

## Architecture

### Core Components

- **BikeGearingMain** (`js/main.js`): Main application controller, manages animation loop and coordinates between components
- **BikeGearingState** (`js/state.js`): Central state management for all simulation parameters (gear teeth, chain length, angles)
- **BikeGearingComputer** (`js/computer.js`): Physics calculations for chain movement and gear rotation
- **BikeGearingRivetsCalculator** (`js/rivet_calculator.js`): Calculates individual chain rivet positions based on gear engagement
- **BikeGearingDrawer** (`js/drawer.js`): Canvas rendering of the entire simulation
- **BikeGearingInteractive** (`js/interactive.js`): Mouse/touch interaction handling for pan and zoom
- **BikeGearingUi** (`js/ui.js` + `js/ui_input.js`): UI controls and parameter inputs

### Specialized Drawing Modules

- **cogs_drawer.js**: Renders chainring and sprocket teeth
- **rivet_drawer.js**: Renders individual chain rivets
- **wheel_drawer.js**: Renders the rear wheel with spokes
- **catenary.js**: Implements catenary curve calculations for the slack chain portion

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
- **Sprocket teeth (r)**: 10-20 teeth on rear gear  
- **Chainstay length (cs)**: 380-430mm distance between gears
- **Chain links (cl)**: 86-110 links (each link = 12.7mm)
- **Chain wear**: 0-2% elongation simulation
- **RPM**: -120 to 120 (negative for reverse)