import { FastifyInstance } from 'fastify';

import { UserController } from '../controllers/user.controller';

const userController = new UserController();

export async function userRoutes(app: FastifyInstance) {
	app.get('/users', userController.list);
	app.get('/users/:id', userController.getById);

	app.post('/users', userController.create);

	app.put('/users/:id', userController.update);

	app.delete('/users/:id', { onRequest: [app.authenticate] }, userController.delete);
}
