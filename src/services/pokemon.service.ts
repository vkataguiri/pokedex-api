import { z } from 'zod';

import { prisma } from '../lib/prisma';

export const createPokemonSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	abilities: z.array(z.string()).min(1).max(3),
	createdBy: z.string(),
});

export const updatePokemonSchema = z.object({
	name: z.string().min(1).optional(),
	type: z.string().min(1).optional(),
	abilities: z.array(z.string()).min(1).max(3).optional(),
});

type CreatePokemonInput = z.infer<typeof createPokemonSchema>;
type UpdatePokemonSchema = z.infer<typeof updatePokemonSchema>;

export class PokemonService {
	async findAll() {
		const pokemon = await prisma.pokemon.findMany();

		return pokemon;
	}

	async findById(id: string) {
		const pokemon = await prisma.pokemon.findUnique({
			where: { id },
		});

		if (!pokemon) {
			throw new Error('POKEMON_NOT_FOUND');
		}

		return pokemon;
	}

	async create(data: CreatePokemonInput) {
		const pokemonExists = await prisma.pokemon.findFirst({
			where: {
				name: {
					equals: data.name,
					mode: 'insensitive',
				},
			},
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

	async update(id: string, data: UpdatePokemonSchema) {
		const existingPokemon = await prisma.pokemon.findUnique({
			where: { id },
		});

		if (!existingPokemon) {
			throw new Error('POKEMON_NOT_FOUND');
		}

		// check if pokemon name already exists
		if (data.name && data.name !== existingPokemon.name) {
			const nameTaken = await prisma.pokemon.findFirst({
				where: {
					name: {
						equals: data.name,
						mode: 'insensitive',
					},
				},
			});

			if (nameTaken) {
				throw new Error('POKEMON_NAME_ALREADY_EXISTS');
			}
		}

		const updatedPokemon = await prisma.pokemon.update({
			where: { id },
			data: {
				name: data.name,
				type: data.type,
				abilities: data.abilities,
			},
		});

		return updatedPokemon;
	}

	async delete(id: string) {
		const pokemon = await prisma.pokemon.findUnique({
			where: { id },
		});

		if (!pokemon) {
			throw new Error('POKEMON_NOT_FOUND');
		}

		await prisma.pokemon.delete({
			where: { id },
		});
	}
}
