import { FastifyInstance } from 'fastify';

import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
	app.post('/login', authController.login);
}
