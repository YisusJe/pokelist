import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { Pokemon } from './types.d'
import { makePokemon, makeTypeResource } from './test/fixtures'

const TYPE_ICON_BY_NAME: Record<string, string> = {
  grass: 'https://example.com/grass.png',
  fire: 'https://example.com/fire.png',
  electric: 'https://example.com/electric.png',
  normal: 'https://example.com/normal.png',
}

function buildPokemonById(): Record<number, Pokemon> {
  const pokemonById: Record<number, Pokemon> = {
    1: makePokemon({
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      types: [{ slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } }],
    }),
    2: makePokemon({
      id: 2,
      name: 'charmander',
      height: 6,
      weight: 85,
      types: [{ slot: 1, type: { name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' } }],
    }),
    3: makePokemon({
      id: 3,
      name: 'pikachu',
      height: 4,
      weight: 60,
      types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } }],
    }),
  }
  for (let id = 4; id <= 100; id++) {
    pokemonById[id] = makePokemon({
      id,
      name: `zz-filler-${String(id).padStart(3, '0')}`,
      height: 9000 + id,
      weight: 9000 + id,
      types: [{ slot: 1, type: { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' } }],
    })
  }
  return pokemonById
}

function installFetchMock(pokemonById: Record<number, Pokemon>) {
  const typeUrlToName = new Map<string, string>()
  Object.values(pokemonById).forEach(pokemon =>
    pokemon.types.forEach(type => typeUrlToName.set(type.type.url, type.type.name))
  )

  vi.stubGlobal('fetch', vi.fn((url: string) => {
    const pokemonId = url.match(/\/pokemon\/(\d+)/)?.[1]
    if (pokemonId) {
      return Promise.resolve({ json: () => Promise.resolve(pokemonById[Number(pokemonId)]) } as Response)
    }
    if (url.includes('/type/')) {
      const name = typeUrlToName.get(url)!
      return Promise.resolve({
        json: () => Promise.resolve(makeTypeResource(name, TYPE_ICON_BY_NAME[name])),
      } as Response)
    }
    return Promise.reject(new Error(`Unmocked fetch url: ${url}`))
  }))
}

async function renderLoadedApp() {
  installFetchMock(buildPokemonById())
  const user = userEvent.setup()
  render(<App />)
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  return { user }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows a loading state before the fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading Pokédex')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders the table once the fetch resolves', async () => {
    await renderLoadedApp()

    expect(screen.getAllByRole('row')).toHaveLength(101)
    expect(screen.getByText('bulbasaur')).toBeInTheDocument()
    expect(screen.getByAltText('grass')).toHaveAttribute('src', TYPE_ICON_BY_NAME.grass)
  })

  it('filters by name case-insensitively', async () => {
    const { user } = await renderLoadedApp()

    await user.type(screen.getByLabelText('Search Pokémon by name'), 'PIKA')

    expect(screen.getByText('pikachu')).toBeInTheDocument()
    expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument()
    expect(screen.queryByText('charmander')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('renders no data rows when the search matches nothing', async () => {
    const { user } = await renderLoadedApp()

    await user.type(screen.getByLabelText('Search Pokémon by name'), 'nonexistent-pokemon')

    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('shows a clear button only while searching, and clears the search on click', async () => {
    const { user } = await renderLoadedApp()

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()

    const searchInput = screen.getByLabelText('Search Pokémon by name')
    await user.type(searchInput, 'pika')
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Clear search'))

    expect(searchInput).toHaveValue('')
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(101)
  })

  it('sorts by Name ascending when the Name header is clicked', async () => {
    const { user } = await renderLoadedApp()

    await user.click(screen.getByRole('columnheader', { name: /^Name$/ }))

    expect(screen.getByRole('columnheader', { name: /^Name$/ })).toHaveAttribute('aria-sort', 'ascending')
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('bulbasaur')).toBeInTheDocument()
  })

  it('sorts by Height ascending when the Height header is clicked', async () => {
    const { user } = await renderLoadedApp()

    await user.click(screen.getByRole('columnheader', { name: /^Height$/ }))

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('pikachu')).toBeInTheDocument()
  })

  it('sorts by Weight ascending when the Weight header is clicked', async () => {
    const { user } = await renderLoadedApp()

    await user.click(screen.getByRole('columnheader', { name: /^Weight$/ }))

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('pikachu')).toBeInTheDocument()
  })

  it('sorts by Type ascending when the Types header is clicked', async () => {
    const { user } = await renderLoadedApp()

    await user.click(screen.getByRole('columnheader', { name: /^Types$/ }))

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('pikachu')).toBeInTheDocument()
  })

  it('always shows original fetch order when sorting by the Pokemon (ID) column', async () => {
    const { user } = await renderLoadedApp()

    await user.click(screen.getByRole('columnheader', { name: /^Height$/ }))
    await user.click(screen.getByRole('columnheader', { name: /^Pokemon$/ }))

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('bulbasaur')).toBeInTheDocument()
    expect(within(rows[2]).getByText('charmander')).toBeInTheDocument()
    expect(within(rows[3]).getByText('pikachu')).toBeInTheDocument()
  })

  it('re-sorts the filtered subset when searching then sorting', async () => {
    const { user } = await renderLoadedApp()

    await user.type(screen.getByLabelText('Search Pokémon by name'), 'a')
    expect(screen.getAllByRole('row')).toHaveLength(4)

    await user.click(screen.getByRole('columnheader', { name: /^Name$/ }))

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('bulbasaur')).toBeInTheDocument()
  })
})
