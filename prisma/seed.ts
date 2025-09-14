import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rootName = process.env.FORUM_ROOT_NAME || 'Forum Root';

async function main() {
  await prisma.category.upsert({
    where: { id: 1 },
    update: { name: rootName },
    create: { name: rootName },
  });
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
