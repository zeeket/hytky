import { type NextApiRequest, type NextApiResponse } from 'next';
import { prisma } from '~/server/db';

const TEST_EVENT_PREFIX = '[TEST]';

/**
 * Test-only API endpoint for managing test events
 * Only available in non-production environments
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in non-production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'DELETE') {
    // Clean all test events (can optionally delete all events with ?all=true)
    const deleteAll = req.query.all === 'true';

    const result = await prisma.event.deleteMany({
      where: deleteAll ? {} : { title: { startsWith: TEST_EVENT_PREFIX } },
    });
    return res.status(200).json({ deleted: result.count });
  }

  if (req.method === 'GET') {
    // Get all events for debugging
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        startTime: true,
        status: true,
        deletedAt: true,
      },
      orderBy: { startTime: 'asc' },
    });
    return res.status(200).json({ events, count: events.length });
  }

  if (req.method === 'PATCH') {
    // Soft-delete all events (hide them without permanent deletion)
    const result = await prisma.event.updateMany({
      where: { deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return res.status(200).json({ hidden: result.count });
  }

  if (req.method === 'PUT') {
    // Restore all soft-deleted events (unhide them)
    const result = await prisma.event.updateMany({
      where: { deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    return res.status(200).json({ restored: result.count });
  }

  if (req.method === 'POST') {
    // Create a test event
    const { daysFromNow = 1, durationHours = 1 } = req.body;

    const now = new Date();
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + daysFromNow);
    eventDate.setHours(15, 0, 0, 0);

    const calendarId = `test-event-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const event = await prisma.event.create({
      data: {
        calendarId,
        title: `${TEST_EVENT_PREFIX} Tomorrow Event`,
        description: 'A test event for E2E testing',
        location: 'Test Location',
        startTime: eventDate,
        endTime: new Date(eventDate.getTime() + durationHours * 3600000),
        timezone: 'Europe/Helsinki',
        allDay: false,
        status: 'confirmed',
      },
    });

    return res.status(201).json(event);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
