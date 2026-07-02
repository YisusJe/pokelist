import { Pokemon, TypeResource } from '../types.d'

const defaultSprites: Pokemon['sprites'] = {
  back_default: '',
  back_female: null,
  back_shiny: '',
  back_shiny_female: null,
  front_default: '',
  front_female: null,
  front_shiny: '',
  front_shiny_female: null,
}

export function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    abilities: [],
    base_experience: 64,
    cries: {
      latest: 'https://pokemoncries.com/latest/1.ogg',
      legacy: 'https://pokemoncries.com/legacy/1.ogg',
    },
    forms: [],
    game_indices: [],
    height: 7,
    held_items: [],
    id: 1,
    is_default: true,
    location_area_encounters: '',
    moves: [],
    name: 'bulbasaur',
    order: 1,
    past_abilities: [],
    past_types: [],
    species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    sprites: {
      ...defaultSprites,
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    },
    stats: [],
    types: [{ slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } }],
    weight: 69,
    ...overrides,
  }
}

export function makeTypeResource(name: string, iconUrl: string): TypeResource {
  return {
    name,
    sprites: {
      'generation-viii': {
        'sword-shield': {
          name_icon: '',
          symbol_icon: iconUrl,
        },
      },
    },
  }
}
