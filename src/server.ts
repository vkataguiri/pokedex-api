import * as dotenv from 'dotenv';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { authRoutes } from './routes/auth.routes';
import { pokemonRoutes } from './routes/pokemon.routes';
import { userRoutes } from './routes/user.routes';

dotenv.config();

const app = Fastify({
	logger: true,
});
const jwtSecret = process.env.JWT_SECRET || 'my-secret-jwt-key';

app.register(cors, {
	origin: true,
});

app.register(jwt, {
	secret: jwtSecret,
});

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});

app.register(authRoutes);
app.register(userRoutes);
app.register(pokemonRoutes);

declare module 'fastify' {
	export interface FastifyInterface {
		authenticate: any;
	}
}

const start = async () => {
	try {
		const port = process.env.PORT ? Number(process.env.PORT) : 3333;
		await app.listen({ port: port, host: '0.0.0.0' });
		console.log(`Server running on port ${port}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
