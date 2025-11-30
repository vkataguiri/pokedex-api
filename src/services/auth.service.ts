import { compare } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '../lib/prisma';

const loginSchema = z.object({
	login: z.string(),
	password: z.string(),
});

type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
	async login(data: LoginInput) {
		const user = await prisma.user.findUnique({
			where: { login: data.login },
		});

		if (!user) {
			throw new Error('INVALID_CREDENTIALS');
		}

		const passwordMatch = await compare(data.password, user.password);

		if (!passwordMatch) {
			throw new Error('INVALID_CREDENTIALS');
		}

		return {
			id: user.id,
			login: user.login,
			name: user.login,
		};
	}
}
