import { z } from 'zod';

import { prisma } from '../lib/prisma';

export const createUserSchema = z.object({
	login: z.string(),
	password: z.string(),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

export class UserService {
	async findAll() {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				login: true,
				createdAt: true,
			},
		});

		return users;
	}

	async findById(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				login: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new Error('USER_NOT_FOUND');
		}

		return user;
	}

	async createUser(data: CreateUserInput) {
		const userExists = await prisma.user.findUnique({
			where: { login: data.login },
		});

		if (userExists) {
			throw new Error('USER_ALREADY_EXISTS');
		}

		const user = await prisma.user.create({
			data: {
				login: data.login,
				password: data.password,
			},
		});

		return { id: user.id, login: user.login };
	}

	async delete(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new Error('USER_NOT_FOUND');
		}

		// Tries to delete user. If user has registered any Pokemon, it prevents the deletion.
		try {
			await prisma.user.delete({
				where: { id },
			});
		} catch (error: any) {
			if (error.code === '23001') {
				throw new Error('USER_HAS_POKEMON');
			}

			throw error;
		}
	}
}
