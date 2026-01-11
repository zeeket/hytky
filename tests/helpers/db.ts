import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client for tests
const globalForPrisma = globalThis as unknown as {
  testPrisma: PrismaClient | undefined
};

export const testPrisma =
  globalForPrisma.testPrisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.testPrisma = testPrisma;
}

export const TEST_EVENT_PREFIX = '[TEST]';

/**
 * Clean all test events from the database
 */
export async function cleanTestEvents() {
  return testPrisma.event.deleteMany({
    where: { title: { startsWith: TEST_EVENT_PREFIX } },
  });
}

/**
 * Create a test event in the database
 */
export async function createTestEvent(overrides?: {
  title?: string;
  description?: string;
  location?: string | null;
  daysFromNow?: number;
  durationHours?: number;
  allDay?: boolean;
}) {
  const now = new Date();
  const eventDate = new Date(now);
  eventDate.setDate(eventDate.getDate() + (overrides?.daysFromNow ?? 1));
  eventDate.setHours(15, 0, 0, 0);

  const googleEventId = `test-event-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  return testPrisma.event.create({
    data: {
      googleEventId,
      title: overrides?.title ?? `${TEST_EVENT_PREFIX} Test Event`,
      description: overrides?.description ?? 'A test event for E2E testing',
      location: overrides?.location ?? 'Test Location',
      startTime: eventDate,
      endTime: new Date(eventDate.getTime() + (overrides?.durationHours ?? 1) * 3600000),
      timezone: 'Europe/Helsinki',
      allDay: overrides?.allDay ?? false,
      status: 'confirmed',
    },
  });
}
