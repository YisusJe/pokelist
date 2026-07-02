# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pokelist: a small React + TypeScript + Vite app that fetches the first 50 Pokémon (Gen I) from the public PokéAPI (`https://pokeapi.co/api/v2/pokemon/{id}`), displays them in a searchable, sortable table, split across two side-by-side tables.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check via `tsc -b` then build with Vite
- `npm run lint` — run ESLint over the whole project
- `npm run preview` — preview the production build

There is no test suite/framework configured in this repo.

## Architecture

- `src/App.tsx` is the single stateful component: it fetches all Pokémon data on mount (parallel `fetch` calls, one per Pokémon ID, via `Promise.all`), then owns search/filter and sort state.
  - Filtering and sorting are derived with `useMemo` from `pokelist` + `searchValue` + `sortBy` — do not introduce redundant state for filtered/sorted results.
  - The combined, sorted/filtered list is split in half (`firstHalf`/`secondHalf`) purely for two-column table layout, not for pagination.
- `src/components/PokemonTable.tsx` is a dumb/presentational table component; sorting is triggered by clicking column headers, which calls `handleChangeSortBy(SortBy.X)` passed down from `App`.
- `src/types.d.tsx` contains the full PokéAPI response shape (`Pokemon` and nested types) generated from the API's actual JSON shape, plus the `SortBy` enum used to drive both the UI and the `sortFunctions` map in `App.tsx`. When the API response shape changes, update this file rather than using ad-hoc `any` types. This is the schema for the data — reference it any time you need to understand the structure of the Pokémon data being worked with.
- No routing, no global state management, no backend — everything lives in this one API-driven component tree.

## Code style

- Use comments sparingly. Only add a comment for genuinely complex code, not straightforward or self-explanatory logic.
