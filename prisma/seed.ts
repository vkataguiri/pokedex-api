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

	const user1 = await prisma.user.findUnique({ where: { login: 'user1' } });

	if (user1) {
		const pokemons = [
			{ name: 'Pikachu', type: 'Elétrico', abilities: ['Choque do Trovão', 'Investida'] },
			{ name: 'Charmander', type: 'Fogo', abilities: ['Brasa', 'Arranhão'] },
			{ name: 'Squirtle', type: 'Água', abilities: ["Jato D'água", 'Investida'] },
			{ name: 'Bulbasaur', type: 'Grama', abilities: ['Chicote de Vinha', 'Folha Navalha'] },
			{ name: 'Charizard', type: 'Fogo', abilities: ['Lança-chamas', 'Voar'] },
			{ name: 'Gengar', type: 'Fantasma', abilities: ['Bola Sombria', 'Hipnose'] },
			{ name: 'Snorlax', type: 'Normal', abilities: ['Descansar', 'Investida Pesada'] },
			{ name: 'Jigglypuff', type: 'Normal', abilities: ['Cantar', 'Tapa Duplo'] },
			{ name: 'Psyduck', type: 'Água', abilities: ['Confusão', 'Arranhão'] },
			{ name: 'Eevee', type: 'Normal', abilities: ['Ataque Rápido', 'Cauda de Ferro'] },
		];

		for (const p of pokemons) {
			await prisma.pokemon.upsert({
				where: { name: p.name },
				update: {},
				create: {
					name: p.name,
					type: p.type,
					abilities: p.abilities,
					createdBy: user1.login,
				},
			});
		}
		console.log(`10 Pokémon created`);
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
