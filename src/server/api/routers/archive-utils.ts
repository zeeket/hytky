import { type PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export async function assertNotArchiveCategory(
  prisma: PrismaClient,
  categoryId: number
): Promise<void> {
  let currentId: number | null = categoryId;
  while (currentId !== null) {
    const cat = (await prisma.category.findUnique({
      where: { id: currentId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select: { isArchive: true, parentCategoryId: true } as any,
    })) as { isArchive: boolean; parentCategoryId: number | null } | null;
    if (!cat) return;
    if (cat.isArchive) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Arkistoon ei voi luoda uusia viestejä tai lankoja.',
      });
    }
    currentId = cat.parentCategoryId;
  }
}
