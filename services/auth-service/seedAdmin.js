const bcrypt = require('bcrypt');
const prisma = require('./src/prismaClient');

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email: 'juanvladimirt@gmail.com' },
    update: {},
    create: {
      email: 'juanvladimirt@gmail.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin user juanvladimirt@gmail.com created successfully.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
