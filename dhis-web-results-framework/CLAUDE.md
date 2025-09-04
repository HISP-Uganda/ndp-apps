# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn start` - Start development server with proxy to https://train.ndpme.go.ug/ndpdb
- `yarn build` - Build production bundle
- `yarn test` - Run tests
- `yarn deploy` - Deploy to DHIS2 instance (requires build first)

### Important Notes
- Uses DHIS2 Application Platform with `d2-app-scripts`
- App entry point is `./src/App.tsx`
- Production builds generate deployable `.zip` files in `build/bundle`

## Architecture

### Core Technologies
- **DHIS2 Platform**: Built on DHIS2 Application Platform using `@dhis2/app-runtime` and `@dhis2/cli-app-scripts`
- **React Router**: Uses TanStack Router (`@tanstack/react-router`) with hash history for client-side routing
- **State Management**: TanStack Query (`@tanstack/react-query`) for server state management
- **Local Storage**: Dexie for IndexedDB operations
- **UI Framework**: Ant Design (antd) components
- **Date Handling**: DayJS with DHIS2 multi-calendar support

### Application Structure

#### Router Configuration (`src/router.tsx`)
- Hash-based routing with nested route structure
- Root layout with NDP (National Development Plan) section containing multiple sub-routes:
  - Goals, Objectives, Visions, FAQs
  - Sub-program actions, outcomes, outputs
  - Policy actions, project performances
  - Libraries, workflows, indicator dictionaries

#### Data Layer
- **Database**: Dexie wrapper (`src/db.ts`) with tables for organization units and analytics
- **Query Options**: Centralized query configurations in `src/query-options.ts`
- **Data Hooks**: Custom hooks in `src/hooks/data-hooks.tsx` for data fetching and analytics

#### Key Components
- **Results Framework**: Main dashboard showing NDPIII images carousel
- **Filter Components**: Organization unit and period selectors
- **Data Tables**: Dynamic table components with performance indicators
- **NDP Components**: Specialized components for different NDP framework levels

#### Data Processing
- **Analytics Processing**: Complex data transformation from DHIS2 analytics API
- **Performance Calculations**: Color-coded performance indicators based on targets vs actuals
- **Data Element Grouping**: Hierarchical data organization by group sets and programs

### DHIS2 Integration
- Uses DHIS2 data engine for API communication
- Fetches analytics data with multi-dimensional queries
- Handles organization units, periods, and data element groups
- Supports attribute-based filtering for NDP versions and programs

### Development Patterns
- TypeScript with Zod validation for search parameters
- Lodash for data manipulation utilities
- Memoized hooks for performance optimization
- Suspense queries for data loading states