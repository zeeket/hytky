import { TRPCError } from '@trpc/server';
import { appRouter } from '~/server/api/root';

/**
 * Events Router Unit Tests
 *
 * These tests verify internal API authentication for gcalservice endpoints.
 * Uses jest-prisma environment for automatic transaction rollback.
 */
describe('eventsRouter', () => {
  const prisma = jestPrisma.client;
  const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || 'test-secret';

  /**
   * Create a tRPC caller for testing internal service endpoints.
   * Supports passing Authorization header for internal API authentication.
   */
  const createInternalServiceCaller = (authHeader?: string) => {
    const ctx = {
      session: null,
      prisma: jestPrisma.client,
      req: {
        headers: {
          authorization: authHeader,
        },
      } as any,
    };
    return appRouter.createCaller(ctx);
  };

  describe('getSyncState', () => {
    it('should throw UNAUTHORIZED without Authorization header', async () => {
      const caller = createInternalServiceCaller();

      await expect(caller.events.getSyncState()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should throw UNAUTHORIZED with invalid secret', async () => {
      const caller = createInternalServiceCaller('Bearer wrong-secret');

      await expect(caller.events.getSyncState()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should throw UNAUTHORIZED with malformed Authorization header', async () => {
      const caller = createInternalServiceCaller('InvalidFormat');

      await expect(caller.events.getSyncState()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should return sync state with valid secret', async () => {
      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      const result = await caller.events.getSyncState();

      // Result should be null if no sync state exists, or the sync state object
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should return existing sync state', async () => {
      // Create sync state with the same calendarId that the procedure uses
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'default';

      // Delete any existing syncState first
      await prisma.syncState.deleteMany({
        where: { calendarId },
      });

      await prisma.syncState.create({
        data: {
          calendarId,
          syncToken: 'test-token-123',
          lastSyncAt: new Date(),
          lastSuccessAt: new Date(),
          errorCount: 0,
        },
      });

      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);
      const result = await caller.events.getSyncState();

      expect(result).toBeDefined();
      expect(result?.calendarId).toBe(calendarId);
      expect(result?.syncToken).toBe('test-token-123');
    });
  });

  describe('syncFromCalendar', () => {
    it('should throw UNAUTHORIZED without Authorization header', async () => {
      const caller = createInternalServiceCaller();

      await expect(
        caller.events.syncFromCalendar({
          events: [],
          syncToken: 'test-token',
        })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should throw UNAUTHORIZED with invalid secret', async () => {
      const caller = createInternalServiceCaller('Bearer wrong-secret');

      await expect(
        caller.events.syncFromCalendar({
          events: [],
          syncToken: 'test-token',
        })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should sync events with valid secret', async () => {
      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      const result = await caller.events.syncFromCalendar({
        events: [
          {
            calendarId: 'event-1',
            title: 'Test Event',
            description: 'Test description',
            location: 'Test location',
            startTime: new Date('2026-02-01T10:00:00Z').toISOString(),
            endTime: new Date('2026-02-01T11:00:00Z').toISOString(),
            timezone: 'UTC',
            allDay: false,
            status: 'confirmed',
          },
        ],
        syncToken: 'new-sync-token',
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      // Verify event was created
      const event = await prisma.event.findUnique({
        where: { calendarId: 'event-1' },
      });

      expect(event).toBeDefined();
      expect(event?.title).toBe('Test Event');
      expect(event?.location).toBe('Test location');
      expect(event?.status).toBe('confirmed');
      expect(event?.deletedAt).toBeNull();
    });

    it('should update sync state', async () => {
      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      await caller.events.syncFromCalendar({
        events: [],
        syncToken: 'updated-token',
      });

      const syncState = await prisma.syncState.findUnique({
        where: { calendarId: process.env.GOOGLE_CALENDAR_ID || 'default' },
      });

      expect(syncState).toBeDefined();
      expect(syncState?.syncToken).toBe('updated-token');
      expect(syncState?.errorCount).toBe(0);
      expect(syncState?.lastError).toBeNull();
      expect(syncState?.lastSuccessAt).toBeDefined();
    });

    it('should mark cancelled events as deleted', async () => {
      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      await caller.events.syncFromCalendar({
        events: [
          {
            calendarId: 'cancelled-event',
            title: 'Cancelled Event',
            startTime: new Date('2026-02-01T10:00:00Z').toISOString(),
            endTime: new Date('2026-02-01T11:00:00Z').toISOString(),
            timezone: 'UTC',
            allDay: false,
            status: 'cancelled',
          },
        ],
        syncToken: 'test-token',
      });

      const event = await prisma.event.findUnique({
        where: { calendarId: 'cancelled-event' },
      });

      expect(event).toBeDefined();
      expect(event?.status).toBe('cancelled');
      expect(event?.deletedAt).not.toBeNull();
    });

    it('should upsert events', async () => {
      // First create an event
      await prisma.event.create({
        data: {
          calendarId: 'event-to-update',
          title: 'Original Title',
          startTime: new Date('2026-02-01T10:00:00Z'),
          endTime: new Date('2026-02-01T11:00:00Z'),
          timezone: 'UTC',
          allDay: false,
          status: 'tentative',
        },
      });

      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      // Update the event
      await caller.events.syncFromCalendar({
        events: [
          {
            calendarId: 'event-to-update',
            title: 'Updated Title',
            description: 'Now with description',
            location: 'New location',
            startTime: new Date('2026-02-01T14:00:00Z').toISOString(),
            endTime: new Date('2026-02-01T15:00:00Z').toISOString(),
            timezone: 'Europe/Helsinki',
            allDay: false,
            status: 'confirmed',
          },
        ],
        syncToken: 'test-token',
      });

      const event = await prisma.event.findUnique({
        where: { calendarId: 'event-to-update' },
      });

      expect(event).toBeDefined();
      expect(event?.title).toBe('Updated Title');
      expect(event?.description).toBe('Now with description');
      expect(event?.location).toBe('New location');
      expect(event?.timezone).toBe('Europe/Helsinki');
      expect(event?.status).toBe('confirmed');
    });
  });

  describe('recordSyncError', () => {
    it('should throw UNAUTHORIZED without Authorization header', async () => {
      const caller = createInternalServiceCaller();

      await expect(
        caller.events.recordSyncError({ error: 'Test error' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should throw UNAUTHORIZED with invalid secret', async () => {
      const caller = createInternalServiceCaller('Bearer wrong-secret');

      await expect(
        caller.events.recordSyncError({ error: 'Test error' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing internal API secret',
      });
    });

    it('should record sync error with valid secret', async () => {
      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      const result = await caller.events.recordSyncError({
        error: 'Test sync error',
      });

      expect(result.success).toBe(true);

      const syncState = await prisma.syncState.findUnique({
        where: { calendarId: process.env.GOOGLE_CALENDAR_ID || 'default' },
      });

      expect(syncState).toBeDefined();
      expect(syncState?.lastError).toBe('Test sync error');
      expect(syncState?.errorCount).toBe(1);
    });

    it('should increment error count on multiple errors', async () => {
      const caller = createInternalServiceCaller(`Bearer ${INTERNAL_API_SECRET}`);

      await caller.events.recordSyncError({ error: 'Error 1' });
      await caller.events.recordSyncError({ error: 'Error 2' });
      await caller.events.recordSyncError({ error: 'Error 3' });

      const syncState = await prisma.syncState.findUnique({
        where: { calendarId: process.env.GOOGLE_CALENDAR_ID || 'default' },
      });

      expect(syncState?.errorCount).toBe(3);
      expect(syncState?.lastError).toBe('Error 3');
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming events without authentication', async () => {
      // This is a public procedure, no auth required
      const caller = createInternalServiceCaller();

      // Create some test events
      await prisma.event.createMany({
        data: [
          {
            calendarId: 'future-event-1',
            title: 'Future Event 1',
            startTime: new Date(Date.now() + 86400000), // +1 day
            endTime: new Date(Date.now() + 90000000),
            timezone: 'UTC',
            allDay: false,
            status: 'confirmed',
          },
          {
            calendarId: 'future-event-2',
            title: 'Future Event 2',
            startTime: new Date(Date.now() + 172800000), // +2 days
            endTime: new Date(Date.now() + 176400000),
            timezone: 'UTC',
            allDay: false,
            status: 'confirmed',
          },
          {
            calendarId: 'past-event',
            title: 'Past Event',
            startTime: new Date(Date.now() - 86400000), // -1 day
            endTime: new Date(Date.now() - 82800000),
            timezone: 'UTC',
            allDay: false,
            status: 'confirmed',
          },
        ],
      });

      const result = await caller.events.getUpcoming({ limit: 10, includeAllDay: true });

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every((e) => new Date(e.startTime) > new Date())).toBe(true);
      expect(result.some((e) => e.title === 'Future Event 1')).toBe(true);
      expect(result.some((e) => e.title === 'Future Event 2')).toBe(true);
      expect(result.some((e) => e.title === 'Past Event')).toBe(false);
    });
  });
});
