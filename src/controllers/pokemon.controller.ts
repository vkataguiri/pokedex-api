import { FastifyReply, FastifyRequest } from 'fastify';
import z, { success } from 'zod';

import { createPokemonSchema, PokemonService } from '../services/pokemon.service';

const pokemonService = new PokemonService();

export class PokemonController {
	async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const data = createPokemonSchema.parse(request.body);
			const pokemon = await pokemonService.createPokemon(data);

			return reply.status(200).send({
				success: true,
				message: 'Pokémon successfully registered.',
				pokemon,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return reply.status(400).send({
					message: 'Validation error.',
					errors: error.issues,
				});
			}

			if (error instanceof Error) {
				if (error.message === 'USER_NOT_FOUND') {
					return reply.status(404).send({
						success: false,
						message: 'Creator user not found.',
					});
				}

				if (error.message === 'POKEMON_ALREADY_EXISTS') {
					return reply.status(409).send({
						success: false,
						message: 'Pokemon name must be unique.',
					});
				}
			}

			console.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Internal server error',
			});
		}
	}
}
