import { z } from 'zod';

import { prisma } from '../lib/prisma';

export const createPokemonSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	abilities: z.array(z.string()).min(1).max(3),
	createdBy: z.string(),
});

type CreatePokemonInput = z.infer<typeof createPokemonSchema>;

export class PokemonService {
	async createPokemon(data: CreatePokemonInput) {
		const pokemonExists = await prisma.pokemon.findUnique({
			where: { name: data.name },
		});

		if (pokemonExists) {
			throw new Error('POKEMON_ALREADY_EXISTS');
		}

		const userExists = await prisma.user.findUnique({
			where: { login: data.createdBy },
		});

		if (!userExists) {
			throw new Error('USER_NOT_FOUND');
		}

		const pokemon = await prisma.pokemon.create({
			data: {
				name: data.name,
				type: data.type,
				abilities: data.abilities,
				createdBy: data.createdBy,
			},
		});

		return pokemon;
	}
}
