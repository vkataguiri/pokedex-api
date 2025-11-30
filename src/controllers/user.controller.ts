import { FastifyReply, FastifyRequest } from 'fastify';
import z, { success } from 'zod';

import { createUserSchema, updateUserSchame, UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
	async list(request: FastifyRequest, reply: FastifyReply) {
		try {
			const users = await userService.findAll();

			return reply.status(200).send({
				success: true,
				data: users,
			});
		} catch (error) {
			console.error(error);
			return reply.status(500).send({
				success: false,
				message: `Error getting users`,
			});
		}
	}

	async getById(request: FastifyRequest, reply: FastifyReply) {
		const getUserParamsSchema = z.object({
			id: z.uuid({ message: 'Invalid ID.' }),
		});

		try {
			const { id } = getUserParamsSchema.parse(request.params);

			const user = await userService.findById(id);

			return reply.status(200).send({
				success: true,
				user,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return reply.status(400).send({
					success: false,
					message: 'Invalid ID.',
					errors: error.issues,
				});
			}

			if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
				return reply.status(400).send({
					success: false,
					message: 'User not found.',
				});
			}

			console.log(error);
			return reply.status(500).send({
				success: false,
				message: 'Internal server error.',
			});
		}
	}

	async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const data = createUserSchema.parse(request.body);
			const user = await userService.create(data);

			return reply.status(201).send({
				message: 'User successfully created.',
				user,
			});
		} catch (error) {
			if (error instanceof Error && error.message === 'USER_ALREADY_EXISTS') {
				return reply.status(409).send({ message: 'Login already in use.' });
			}
			return reply.status(500).send({
				success: false,
				message: 'Error creating user.',
			});
		}
	}

	async update(request: FastifyRequest, reply: FastifyReply) {
		const getUserParamsSchema = z.object({
			id: z.uuid({ message: 'ID inválido' }),
		});

		try {
			const { id } = getUserParamsSchema.parse(request.params);
			const data = updateUserSchame.parse(request.body);

			if (!data.login && !data.password) {
				return reply.status(400).send({ message: 'No fields were updated.' });
			}

			const user = await userService.update(id, data);

			return reply.status(200).send({
				success: true,
				message: 'User successfully updated.',
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return reply.status(400).send({
					success: false,
					message: 'Invalid data.',
					errors: error.issues,
				});
			}

			if (error instanceof Error) {
				if (error.message === 'USER_NOT_FOUND') {
					return reply.status(404).send({
						success: false,
						message: 'User not found.',
					});
				}

				if (error.message === 'LOGIN_ALREADY_TAKEN') {
					return reply.status(409).send({
						success: false,
						message: 'This username is already taken.',
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

	async delete(request: FastifyRequest, reply: FastifyReply) {
		const getUserParamsSchema = z.object({
			id: z.uuid({ message: 'Invalid ID.' }),
		});
		try {
			const { id } = getUserParamsSchema.parse(request.params);

			await userService.delete(id);

			return reply.status(200).send({
				success: true,
				message: 'User successfully deleted.',
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return reply.status(400).send({
					success: false,
					message: 'Invalid ID.',
					errors: error.issues,
				});
			}

			if (error instanceof Error) {
				if (error.message === 'USER_NOT_FOUND') {
					return reply.status(404).send({
						success: false,
						message: `User not found.`,
					});
				}

				if (error.message === 'USER_HAS_POKEMON') {
					return reply.status(404).send({
						success: false,
						message: `User can't be deleted because he has Pokemon.`,
					});
				}
			}

			console.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Internal server error.',
			});
		}
	}
}
