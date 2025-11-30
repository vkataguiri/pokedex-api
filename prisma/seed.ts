import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('Starting DB default users...');
	const users = [
		{ login: 'user1', password: '123' },
		{ login: 'user2', password: '123' },
		{ login: 'user3', password: '123' },
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
