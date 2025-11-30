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
	async findAll(filter?: { type?: string; ability?: string }) {
		const where: any = {};

		if (filter?.type) {
			where.type = {
				contains: filter.type,
				mode: 'insensitive',
			};
		}

		if (filter?.ability) {
			where.abilities = {
				has: filter.ability,
			};
		}

		const pokemon = await prisma.pokemon.findMany({ where });

		return pokemon;
	}

	async getDashboardStats() {
		const total = await prisma.pokemon.count();

		const typesGroup = await prisma.pokemon.groupBy({
			by: ['type'],
			_count: { type: true },
			orderBy: { _count: { type: 'desc' } },
			take: 3,
		});

		const topTypes = typesGroup.map((t) => ({
			name: t.type,
			count: t._count.type,
		}));

		const allPokemons = await prisma.pokemon.findMany({
			select: { abilities: true },
		});

		const abilityCounts: Record<string, number> = {};
		allPokemons.forEach((p) => {
			p.abilities.forEach((ability) => {
				const normalized = ability.trim();
				abilityCounts[normalized] = (abilityCounts[normalized] || 0) + 1;
			});
		});

		const topAbilities = Object.entries(abilityCounts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 3);

		return {
			total,
			topTypes,
			topAbilities,
		};
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
