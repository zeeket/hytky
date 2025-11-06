import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rootName = process.env.FORUM_ROOT_NAME || 'Forum Root';

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Create root category
  await prisma.category.upsert({
    where: { id: 1 },
    update: { name: rootName },
    create: { name: rootName },
  });

  // Create test user for e2e tests (only in development)
  // This user corresponds to the test session in tests/helpers/test-session.ts
  if (!isProduction) {
    await prisma.user.upsert({
      where: { id: '999999999' },
      update: {
        name: 'Test User',
      },
      create: {
        id: '999999999',
        name: 'Test User',
      },
    });
  }

  console.log('✅ Seed completed successfully');
  console.log('   - Root category created');
  if (!isProduction) {
    console.log('   - Test user created (ID: 999999999)');
  }
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
