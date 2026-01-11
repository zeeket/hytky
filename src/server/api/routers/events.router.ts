import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const syncEventSchema = z.object({
  calendarId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string(),
  allDay: z.boolean(),
  status: z.string(),
});

export const eventsRouter = createTRPCRouter({
  // Public query: Get upcoming events
  getUpcoming: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        includeAllDay: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const events = await ctx.prisma.event.findMany({
        where: {
          startTime: { gte: now },
          deletedAt: null,
          status: { in: ['confirmed', 'tentative'] },
          ...(input.includeAllDay ? {} : { allDay: false }),
        },
        orderBy: { startTime: 'asc' },
        take: input.limit,
      });

      return events;
    }),

  // Internal mutation: Sync events from gcalservice
  syncFromCalendar: publicProcedure
    .input(
      z.object({
        events: z.array(syncEventSchema),
        syncToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert events
      const operations = input.events.map((event) =>
        ctx.prisma.event.upsert({
          where: { calendarId: event.calendarId },
          update: {
            title: event.title,
            description: event.description,
            location: event.location,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            timezone: event.timezone,
            allDay: event.allDay,
            status: event.status,
            deletedAt: event.status === 'cancelled' ? new Date() : null,
          },
          create: {
            calendarId: event.calendarId,
            title: event.title,
            description: event.description,
            location: event.location,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            timezone: event.timezone,
            allDay: event.allDay,
            status: event.status,
            deletedAt: event.status === 'cancelled' ? new Date() : null,
          },
        })
      );

      await ctx.prisma.$transaction(operations);

      // Update sync state
      await ctx.prisma.syncState.upsert({
        where: { calendarId: process.env.GOOGLE_CALENDAR_ID || 'default' },
        update: {
          syncToken: input.syncToken,
          lastSyncAt: new Date(),
          lastSuccessAt: new Date(),
          errorCount: 0,
          lastError: null,
        },
        create: {
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'default',
          syncToken: input.syncToken,
        },
      });

      return { success: true, count: input.events.length };
    }),

  // Internal query: Get sync state for gcalservice
  getSyncState: publicProcedure.query(async ({ ctx }) => {
    const syncState = await ctx.prisma.syncState.findUnique({
      where: { calendarId: process.env.GOOGLE_CALENDAR_ID || 'default' },
    });

    return syncState;
  }),

  // Internal mutation: Record sync errors
  recordSyncError: publicProcedure
    .input(z.object({ error: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.syncState.upsert({
        where: { calendarId: process.env.GOOGLE_CALENDAR_ID || 'default' },
        update: {
          lastSyncAt: new Date(),
          errorCount: { increment: 1 },
          lastError: input.error,
        },
        create: {
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'default',
          lastError: input.error,
          errorCount: 1,
        },
      });

      return { success: true };
    }),
});
