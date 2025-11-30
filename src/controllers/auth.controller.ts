import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
	async login(request: FastifyRequest, reply: FastifyReply) {
		const loginBodySchema = z.object({
			login: z.string(),
			password: z.string(),
		});

		try {
			const { login, password } = loginBodySchema.parse(request.body);
			const user = await authService.login({ login, password });

			return reply.status(200).send({
				message: 'Successfully logged in',
				success: true,
				user,
			});
		} catch (error) {
			if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
				return reply.status(401).send({
					message: 'Login or password incorrect',
					success: false,
				});
			}

			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	}
}
