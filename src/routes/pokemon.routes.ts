import { FastifyInstance } from 'fastify';

import { PokemonController } from '../controllers/pokemon.controller';

const pokemonController = new PokemonController();

export async function pokemonRoutes(app: FastifyInstance) {
	app.post('/pokemon', pokemonController.create);
}
