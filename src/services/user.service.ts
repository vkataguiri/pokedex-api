import { optional, z } from 'zod';

import { prisma } from '../lib/prisma';

export const createUserSchema = z.object({
	login: z.string(),
	password: z.string(),
});

export const updateUserSchame = z.object({
	login: z.string().optional(),
	password: z.string().optional(),
});

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchame>;

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

	async create(data: CreateUserInput) {
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

	async update(id: string, data: UpdateUserInput) {
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			throw new Error('USER_NOT_FOUND');
		}

		// checks if new user login already exists
		if (data.login && data.login !== existingUser.login) {
			const loginInUse = await prisma.user.findFirst({
				where: {
					login: {
						equals: data.login,
						mode: 'insensitive',
					},
				},
			});

			if (loginInUse) {
				throw new Error('LOGIN_ALREADY_TAKEN');
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				login: data.login,
				password: data.password,
			},
			select: {
				id: true,
				login: true,
				createdAt: true,
			},
		});

		return updatedUser;
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
