import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_EVENT_PREFIX = '[TEST]';

/**
 * Creates mock events in the database for testing
 */
export async function seedTestEvents() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0); // 3 PM

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(18, 0, 0, 0); // 6 PM

  const events = [
    {
      googleEventId: 'test-event-1',
      title: `${TEST_EVENT_PREFIX} Tomorrow Event`,
      description: 'A test event happening tomorrow',
      location: 'Test Location 1',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 3600000), // +1 hour
      timezone: 'Europe/Helsinki',
      allDay: false,
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
    {
      googleEventId: 'test-event-2',
      title: `${TEST_EVENT_PREFIX} Next Week Event`,
      description: 'A test event happening next week',
      location: 'Test Location 2',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 7200000), // +2 hours
      timezone: 'Europe/Helsinki',
      allDay: false,
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
    {
      googleEventId: 'test-event-3',
      title: `${TEST_EVENT_PREFIX} All Day Event`,
      description: 'An all-day test event',
      location: null,
      startTime: tomorrow,
      endTime: tomorrow,
      timezone: 'Europe/Helsinki',
      allDay: true,
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { googleEventId: event.googleEventId },
      update: event,
      create: event,
    });
  }

  console.log(`✅ Seeded ${events.length} test events`);
  return events.length;
}

/**
 * Removes all test events from the database
 */
export async function cleanTestEvents() {
  const result = await prisma.event.deleteMany({
    where: {
      title: {
        startsWith: TEST_EVENT_PREFIX,
      },
    },
  });

  console.log(`🧹 Cleaned ${result.count} test events`);
  return result.count;
}

/**
 * CLI interface
 */
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'seed':
        await seedTestEvents();
        break;
      case 'clean':
        await cleanTestEvents();
        break;
      case 'reset':
        await cleanTestEvents();
        await seedTestEvents();
        break;
      default:
        console.log('Usage: node seed-test-events.js [seed|clean|reset]');
        console.log('  seed  - Add test events to database');
        console.log('  clean - Remove all test events');
        console.log('  reset - Clean then seed');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
