const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // À personnaliser :
  const email = 'admin@admin.com';
  const password = 'admin'; // Change ce mot de passe !

  // Vérifie qu'il n'y a pas déjà un admin avec cet email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin créé :', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
