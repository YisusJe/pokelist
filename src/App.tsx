import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Pokemon, SortBy, TypeResource } from './types.d'
import { PokemonTable } from './components/PokemonTable'
import { PokeballIcon } from './icons/PokeballIcon'
import { SearchIcon } from './icons/SearchIcon'
import { ClearIcon } from './icons/ClearIcon'

const sizeOfTable = 100

function App() {
  const [pokelist, setPokelist] = useState<Pokemon[]>([])
  const [typeIcons, setTypeIcons] = useState<Record<string, string>>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.ID)
  const [isLoading, setIsLoading] = useState(true)
  const pokelistOriginal = useRef<Pokemon[]>([])

  useEffect(() => {
    const handleGetPokedexKanto = async () => {
      try {
        setIsLoading(true)
        const pokeEndpoints = [...Array(sizeOfTable)].map((_, i) =>
          `https://pokeapi.co/api/v2/pokemon/${i + 1}`
        )
        const data: Pokemon[] = await Promise.all(
          pokeEndpoints.map(endpoint =>
            fetch(endpoint).then((res) => res.json())
          )
        )
        setPokelist(data)
        pokelistOriginal.current = data

        const typeUrls = Array.from(
          new Set(data.flatMap(pokemon => pokemon.types.map(type => type.type.url)))
        )
        const typeResources: TypeResource[] = await Promise.all(
          typeUrls.map(url => fetch(url).then((res) => res.json()))
        )
        setTypeIcons(Object.fromEntries(
          typeResources.map(type => [type.name, type.sprites['generation-viii']['sword-shield'].symbol_icon])
        ))
      } catch (error) {
        console.error('Error fetching Pokemon:', error)
      } finally {
        setIsLoading(false)
      }
    }
    handleGetPokedexKanto()
  }, [])

  const handleChangeSortBy = useCallback((sortBy: SortBy) => {
    setSortBy(sortBy)
  }, [])

  // Memoize filtered pokemons
  const filteredPokemons = useMemo(() => {
    if (!searchValue) return pokelist
    return pokelist.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [pokelist, searchValue])

  // Memoize sorting function
  const getSortedPokemons = useMemo(() => {
    const sortFunctions = {
      [SortBy.NAME]: (a: Pokemon, b: Pokemon) => a.name.localeCompare(b.name),
      [SortBy.TYPE]: (a: Pokemon, b: Pokemon) => {
        const aTypes = a.types.map(type => type.type.name).join(', ')
        const bTypes = b.types.map(type => type.type.name).join(', ')
        return aTypes.localeCompare(bTypes)
      },
      [SortBy.HEIGHT]: (a: Pokemon, b: Pokemon) => a.height - b.height,
      [SortBy.WEIGHT]: (a: Pokemon, b: Pokemon) => a.weight - b.weight,
      [SortBy.ID]: () => 0
    }
    
    return sortBy === SortBy.ID 
      ? filteredPokemons 
      : [...filteredPokemons].sort(sortFunctions[sortBy])
  }, [filteredPokemons, sortBy])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchValue(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchValue('')
  }, [])

  if (isLoading) {
    return (
      <div className='loading-screen' role='status' aria-live='polite'>
        <PokeballIcon className='loading-mark' />
        <p>Loading Pokédex&hellip;</p>
      </div>
    )
  }

  return (
    <>
      <div className='title-container'>
        <div className='brand'>
          <PokeballIcon className='brand-mark' />
          <h1 className='brand-name'>Poke<em>list</em></h1>
        </div>
        <div className='search-field'>
          <SearchIcon className='search-icon' />
          <input
            type='text'
            className='search-input'
            placeholder='Search Pokémon…'
            value={searchValue}
            onChange={handleSearch}
            aria-label='Search Pokémon by name'
          />
          {searchValue && (
            <button
              type='button'
              className='search-clear'
              onClick={handleClearSearch}
              aria-label='Clear search'
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>
      <div className='table-container'>
        <PokemonTable
          pokelist={getSortedPokemons}
          typeIcons={typeIcons}
          sortBy={sortBy}
          handleChangeSortBy={handleChangeSortBy}
        />
      </div>
    </>
  )
}

export default App
