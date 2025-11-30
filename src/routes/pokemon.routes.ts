import { FastifyInstance } from 'fastify';

import { PokemonController } from '../controllers/pokemon.controller';

const pokemonController = new PokemonController();

export async function pokemonRoutes(app: FastifyInstance) {
	app.get('/pokemon', pokemonController.list);
	app.get('/pokemon/:id', pokemonController.getById);

	app.post('/pokemon', pokemonController.create);

	app.delete('/pokemon/:id', pokemonController.delete);
}
