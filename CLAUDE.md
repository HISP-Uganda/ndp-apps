# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo containing three DHIS2 applications for Uganda's National Development Plan (NDP) data management:

- **`dhis-web-results-framework/`** - Main results framework dashboard (production-ready)
- **`performance-data-entry/`** - Performance data entry application (development/skeleton)
- **`target-baseline-data-entry/`** - Target and baseline data entry application (development/skeleton)

## Commands

This monorepo uses yarn workspaces for dependency management. You can run commands from the root or within individual application directories.

### Root-Level Workspace Commands
```bash
# Install all dependencies for all workspaces
yarn install

# Start specific applications
yarn start:results          # dhis-web-results-framework
yarn start:performance      # performance-data-entry  
yarn start:target          # target-baseline-data-entry

# Build all applications
yarn build

# Build specific applications
yarn build:results
yarn build:performance
yarn build:target

# Test all applications
yarn test

# Test specific applications  
yarn test:results
yarn test:performance
yarn test:target

# Deploy specific applications (requires build first)
yarn deploy:results
yarn deploy:performance
yarn deploy:target

# Clean all node_modules
yarn clean
```

### Individual Application Commands
You can still run commands from within each application directory:
```bash
cd dhis-web-results-framework
yarn start    # or yarn build, yarn test, yarn deploy
```

### Workspace Benefits
- **Shared Dependencies**: Common dependencies are hoisted to root
- **Cross-workspace Dependencies**: Applications can reference each other
- **Unified Commands**: Run operations across all applications from root
- **Efficient Installation**: Faster installs with dependency deduplication

## Architecture Overview

### Technology Stack
All applications are built on:
- **DHIS2 Application Platform** - Using `@dhis2/cli-app-scripts` and `@dhis2/app-runtime`
- **React + TypeScript** - Frontend framework with type safety
- **d2-app-scripts** - DHIS2-specific build and development tools

### Application States

#### dhis-web-results-framework (Production Application)
- **Purpose**: Main NDP results framework dashboard with analytics and reporting
- **Architecture**: Complex application with:
  - TanStack Router for client-side routing with hash history
  - TanStack Query for server state management
  - Dexie for IndexedDB local storage
  - Ant Design UI components
  - Multi-dimensional analytics from DHIS2 API
- **Key Features**: Organization unit filtering, period selection, performance indicators, NDP framework visualization
- **Development Server**: Proxies to `https://train.ndpme.go.ug/ndpdb`
- **See**: `dhis-web-results-framework/CLAUDE.md` for detailed architecture

#### performance-data-entry & target-baseline-data-entry (Skeleton Applications)
- **Purpose**: Data entry interfaces for NDP performance metrics and targets/baselines
- **Current State**: Basic DHIS2 app scaffolding with "Hello World" functionality
- **Architecture**: Minimal setup with just `@dhis2/app-runtime` for data queries
- **Development Status**: Ready for feature implementation

### DHIS2 Integration Patterns

#### Common Data Access Patterns
- `useDataQuery` hook for DHIS2 API calls
- Standard DHIS2 authentication and session management  
- Resource-based query structure: `{ resource: 'endpoint' }`
- Built-in loading states and error handling

#### Deployment Pattern
- Production builds generate `.zip` files in `build/bundle/`
- Deploy via DHIS2 App Management with admin credentials
- Apps integrate with DHIS2's authentication and authorization system

## Development Guidelines

### Working with Yarn Workspaces
The repository is configured as a yarn workspace monorepo:

```bash
# From root - install all dependencies
yarn install

# Start any application from root
yarn start:results    # or yarn start:performance or yarn start:target

# Or navigate to specific directory (dependencies already installed)
cd dhis-web-results-framework
yarn start
```

#### Adding Dependencies
```bash
# Add dependency to specific workspace
yarn workspace dhis-web-results-framework add package-name

# Add dev dependency to root (shared across workspaces)  
yarn add -D -W package-name

# Add dependency to all workspaces
yarn workspaces add package-name
```

### Key Files per Application
- `src/App.tsx` - Main application entry point
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `public/manifest.webapp` - DHIS2 app manifest

### DHIS2 Development Context
- All apps run within DHIS2 instance context
- Authentication handled by DHIS2 platform
- API calls automatically include user session
- Apps deploy as web applications within DHIS2 ecosystem

### Extending Skeleton Applications
The `performance-data-entry` and `target-baseline-data-entry` applications are ready for implementation:
- Basic DHIS2 integration already configured
- TypeScript setup complete
- Follow patterns from `dhis-web-results-framework` for:
  - Complex routing (TanStack Router)
  - State management (TanStack Query)  
  - UI components (Ant Design)
  - Data analytics integration