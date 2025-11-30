import Fastify from 'fastify';

import cors from '@fastify/cors';

import { authRoutes } from './routes/auth.routes';
import { pokemonRoutes } from './routes/pokemon.routes';
import { userRoutes } from './routes/user.routes';

const app = Fastify({
	logger: true,
});

app.register(cors, {
	origin: true,
});

app.register(authRoutes);
app.register(userRoutes);
app.register(pokemonRoutes);

const start = async () => {
	try {
		const port = process.env.PORT ? Number(process.env.PORT) : 3333;

		await app.listen({
			port: port,
			host: '0.0.0.0',
		});
		console.log(`Server running on port ${port}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
