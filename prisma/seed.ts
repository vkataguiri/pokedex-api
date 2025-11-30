import { hash } from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('Starting DB seed...');

	await prisma.pokemon.deleteMany();
	await prisma.user.deleteMany();

	const passwordHash = await hash('123', 6);

	const users = [
		{ login: 'user1', password: passwordHash },
		{ login: 'user2', password: passwordHash },
		{ login: 'user3', password: passwordHash },
	];

	for (const u of users) {
		const user = await prisma.user.upsert({
			where: { login: u.login },
			update: {},
			create: {
				login: u.login,
				password: u.password,
			},
		});
		console.log(`User created/verified: ${user.login}`);
	}

	const ash = await prisma.user.findUnique({ where: { login: 'user1' } });

	if (ash) {
		const pikachu = await prisma.pokemon.upsert({
			where: { name: 'Pikachu' },
			update: {},
			create: {
				name: 'Pikachu',
				type: 'Elétrico',
				abilities: ['Choque do Trovão', 'Investida'],
				createdBy: ash.login,
			},
		});
		console.log(`Pokémon created: ${pikachu.name}`);
	}

	console.log('Seed users and Pokémon created!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
