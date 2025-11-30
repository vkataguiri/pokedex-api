import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
	export interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: {
			id: string;
			login: string;
			name: string;
		};
	}
}
