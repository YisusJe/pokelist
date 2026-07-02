# Pokelist

A small React + TypeScript + Vite app that fetches the first 50 Pokémon (Gen I) from the [PokéAPI](https://pokeapi.co/) and displays them in a searchable, sortable table, split across two side-by-side tables.

## Features

- Fetches Gen I Pokémon data (id, name, types, sprite, etc.) from `https://pokeapi.co/api/v2/pokemon/{id}`
- Search/filter by Pokémon name
- Sort by column (id, name, type, etc.)
- Two-column table layout for easier browsing

## Tech Stack

- [React](https://react.dev/) 18
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Development

Start the Vite dev server:

```bash
npm run dev
```

### Build

Type-check and build for production:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Lint

Run ESLint over the project:

```bash
npm run lint
```

## Project Structure

```
src/
├── App.tsx                  # Main stateful component (data fetching, search/sort state)
├── components/
│   └── PokemonTable.tsx     # Presentational table component
├── icons/                   # SVG icon components
├── types.d.tsx              # PokéAPI response types and SortBy enum
└── main.tsx                 # App entry point
```

There is no test suite/framework configured in this repo.
