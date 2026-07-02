import { Pokemon, SortBy } from "../types.d"
import { CheckIcon } from "../icons/CheckIcon"
import { SoundIcon } from "../icons/SoundIcon"

interface Props {
  pokelist: Pokemon[],
  typeIcons: Record<string, string>,
  sortBy: SortBy,
  handleChangeSortBy: (sortBy: SortBy) => void
}

const columns: { label: string, sortBy: SortBy }[] = [
  { label: 'Pokemon', sortBy: SortBy.ID },
  { label: 'Name', sortBy: SortBy.NAME },
  { label: 'Height', sortBy: SortBy.HEIGHT },
  { label: 'Weight', sortBy: SortBy.WEIGHT },
  { label: 'Types', sortBy: SortBy.TYPE },
]

const playCry = (pokemon: Pokemon) => {
  const cryUrl = pokemon.cries.latest ?? pokemon.cries.legacy
  if (!cryUrl) return
  const audio = new Audio(cryUrl)
  audio.volume = 0.5
  audio.play()
}

export const PokemonTable = ({ pokelist, typeIcons, sortBy, handleChangeSortBy }: Props) => {
  return (
    <table>
        <thead>
          <tr>
            {columns.map((column) => {
              const isActive = sortBy === column.sortBy
              return (
                <th
                  key={column.sortBy}
                  className="cursor"
                  aria-sort={isActive ? 'ascending' : 'none'}
                  onClick={() => handleChangeSortBy(column.sortBy)}
                >
                  <span className="th-content">
                    {column.label}
                    {isActive && <CheckIcon className="sort-indicator" />}
                  </span>
                </th>
              )
            })}
            <th>Sound</th>
          </tr>
        </thead>
        <tbody>
          {pokelist.map((pokemon: Pokemon) => (
            <tr key={pokemon.id}>
              <td data-label="Pokemon">
                <img src={pokemon.sprites.front_default} alt={pokemon.name} />
              </td>
              <td data-label="Name">{pokemon.name}</td>
              <td data-label="Height">{pokemon.height}</td>
              <td data-label="Weight">{pokemon.weight}</td>
              <td data-label="Types">{pokemon.types.map((type) => (
                <img
                  key={type.slot}
                  className="type-icon"
                  src={typeIcons[type.type.name]}
                  alt={type.type.name}
                  title={type.type.name}
                />
              ))}
              </td>
              <td data-label="Sound">
                <button
                  type="button"
                  className="sound-button"
                  onClick={() => playCry(pokemon)}
                  aria-label={`Play ${pokemon.name}'s cry`}
                >
                  <SoundIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  )
}
