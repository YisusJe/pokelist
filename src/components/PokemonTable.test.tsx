import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PokemonTable } from './PokemonTable'
import { SortBy } from '../types.d'
import { makePokemon } from '../test/fixtures'

const noop = () => {}

describe('PokemonTable', () => {
  it('renders one row per pokemon, in the given order', () => {
    const pokelist = [
      makePokemon({ id: 1, name: 'bulbasaur' }),
      makePokemon({ id: 2, name: 'charmander' }),
      makePokemon({ id: 3, name: 'squirtle' }),
    ]
    render(<PokemonTable pokelist={pokelist} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    const rows = screen.getAllByRole('row')
    // first row is the header row
    expect(rows).toHaveLength(4)
    expect(within(rows[1]).getByText('bulbasaur')).toBeInTheDocument()
    expect(within(rows[2]).getByText('charmander')).toBeInTheDocument()
    expect(within(rows[3]).getByText('squirtle')).toBeInTheDocument()
  })

  it('renders the fixed column headers in the fixed order regardless of sortBy', () => {
    render(<PokemonTable pokelist={[]} typeIcons={{}} sortBy={SortBy.WEIGHT} handleChangeSortBy={noop} />)

    const headers = screen.getAllByRole('columnheader')
    expect(headers.map(h => h.textContent?.replace(/✓|✔/g, '').trim())).toEqual([
      'Pokemon',
      'Name',
      'Height',
      'Weight',
      'Types',
      'Sound',
    ])
  })

  it.each([
    ['Pokemon', SortBy.ID],
    ['Name', SortBy.NAME],
    ['Height', SortBy.HEIGHT],
    ['Weight', SortBy.WEIGHT],
    ['Types', SortBy.TYPE],
  ])('clicking the "%s" header calls handleChangeSortBy with the right SortBy value', async (label, sortBy) => {
    const handleChangeSortBy = vi.fn()
    const user = userEvent.setup()
    render(<PokemonTable pokelist={[]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={handleChangeSortBy} />)

    await user.click(screen.getByRole('columnheader', { name: new RegExp(`^${label}$`) }))

    expect(handleChangeSortBy).toHaveBeenCalledTimes(1)
    expect(handleChangeSortBy).toHaveBeenCalledWith(sortBy)
  })

  it('clicking the "Sound" header does not call handleChangeSortBy', async () => {
    const handleChangeSortBy = vi.fn()
    const user = userEvent.setup()
    render(<PokemonTable pokelist={[]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={handleChangeSortBy} />)

    await user.click(screen.getByRole('columnheader', { name: 'Sound' }))

    expect(handleChangeSortBy).not.toHaveBeenCalled()
  })

  it('marks only the active column as aria-sort="ascending"', () => {
    render(<PokemonTable pokelist={[]} typeIcons={{}} sortBy={SortBy.HEIGHT} handleChangeSortBy={noop} />)

    expect(screen.getByRole('columnheader', { name: /^Height$/ })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: /^Name$/ })).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: /^Weight$/ })).toHaveAttribute('aria-sort', 'none')
  })

  it('shows the sort indicator only inside the active column header', () => {
    render(<PokemonTable pokelist={[]} typeIcons={{}} sortBy={SortBy.NAME} handleChangeSortBy={noop} />)

    const activeHeader = screen.getByRole('columnheader', { name: /^Name/ })
    expect(activeHeader.querySelector('.sort-indicator')).not.toBeNull()

    const inactiveHeader = screen.getByRole('columnheader', { name: /^Height$/ })
    expect(inactiveHeader.querySelector('.sort-indicator')).toBeNull()
  })

  it('renders the pokemon image with the sprite src and name as alt text', () => {
    const pokemon = makePokemon({
      id: 25,
      name: 'pikachu',
      sprites: { ...makePokemon().sprites, front_default: 'https://example.com/pikachu.png' },
    })
    render(<PokemonTable pokelist={[pokemon]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    const image = screen.getByAltText('pikachu')
    expect(image).toHaveAttribute('src', 'https://example.com/pikachu.png')
  })

  it('resolves each type icon src from the typeIcons prop', () => {
    const pokemon = makePokemon({
      id: 1,
      name: 'bulbasaur',
      types: [
        { slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } },
        { slot: 2, type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' } },
      ],
    })
    const typeIcons = { grass: 'https://example.com/grass.png', poison: 'https://example.com/poison.png' }
    render(<PokemonTable pokelist={[pokemon]} typeIcons={typeIcons} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    expect(screen.getByAltText('grass')).toHaveAttribute('src', typeIcons.grass)
    expect(screen.getByAltText('poison')).toHaveAttribute('src', typeIcons.poison)
  })

  it('labels the sound button with the pokemon name', () => {
    const pokemon = makePokemon({ id: 1, name: 'bulbasaur' })
    render(<PokemonTable pokelist={[pokemon]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    expect(screen.getByRole('button', { name: "Play bulbasaur's cry" })).toBeInTheDocument()
  })

  it('plays the cry when cries.latest is set', async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play')
    const user = userEvent.setup()
    const pokemon = makePokemon({
      id: 1,
      name: 'bulbasaur',
      cries: { latest: 'https://example.com/latest.ogg', legacy: '' },
    })
    render(<PokemonTable pokelist={[pokemon]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    await user.click(screen.getByRole('button', { name: "Play bulbasaur's cry" }))

    expect(playSpy).toHaveBeenCalledTimes(1)
  })

  it('falls back to cries.legacy when cries.latest is falsy', async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play')
    const user = userEvent.setup()
    const pokemon = makePokemon({
      id: 1,
      name: 'bulbasaur',
      cries: { latest: null as unknown as string, legacy: 'https://example.com/legacy.ogg' },
    })
    render(<PokemonTable pokelist={[pokemon]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    await user.click(screen.getByRole('button', { name: "Play bulbasaur's cry" }))

    expect(playSpy).toHaveBeenCalledTimes(1)
  })

  it('does not throw or play when both cries.latest and cries.legacy are falsy', async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play')
    const user = userEvent.setup()
    const pokemon = makePokemon({ id: 1, name: 'bulbasaur', cries: { latest: '', legacy: '' } })
    render(<PokemonTable pokelist={[pokemon]} typeIcons={{}} sortBy={SortBy.ID} handleChangeSortBy={noop} />)

    await user.click(screen.getByRole('button', { name: "Play bulbasaur's cry" }))

    expect(playSpy).not.toHaveBeenCalled()
  })
})
