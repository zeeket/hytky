import { env } from './config.js';
import { syncEvents } from './google-calendar.js';
import type { SyncEventPayload } from './types.js';

export const performSync = async (): Promise<void> => {
  console.log('[SYNC] Starting calendar sync...');

  try {
    // 1. Fetch current sync state from main app
    const syncStateUrl = `${env.MAIN_APP_URL}/api/trpc/events.getSyncState`;
    const syncStateResponse = await fetch(syncStateUrl, { method: 'GET' });

    const syncState = (await syncStateResponse.json()) as {
      result?: { data?: { syncToken?: string } };
    };
    const currentSyncToken = syncState?.result?.data?.syncToken;
    console.log('[SYNC] Current sync token:', currentSyncToken || 'none (full sync)');

    // 2. Fetch events from Google Calendar
    console.log('[SYNC] Fetching events from Google Calendar...');
    const { events, nextSyncToken, error } = await syncEvents(currentSyncToken);

    if (error) {
      console.error('[SYNC] Error fetching events from Google Calendar:', error);
      // Post error to main app
      const errorUrl = `${env.MAIN_APP_URL}/api/trpc/events.recordSyncError?batch=1`;
      console.log('[SYNC] Recording error to:', errorUrl);
      await fetch(errorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { error },
          },
        }),
      });
      return;
    }

    console.log(`[SYNC] Fetched ${events.length} events`);

    // 3. Send events to main app for storage
    const syncPayload: SyncEventPayload[] = events.map((e) => {
      // Convert to UTC ISO string format
      let startTime: string;
      let endTime: string;

      if (e.start.dateTime) {
        // Timed event - convert timezone-aware datetime to UTC
        startTime = new Date(e.start.dateTime).toISOString();
        endTime = new Date(e.end.dateTime!).toISOString();
      } else if (e.start.date) {
        // All-day event - use date at midnight UTC
        startTime = `${e.start.date}T00:00:00Z`;
        endTime = `${e.end.date}T00:00:00Z`;
      } else {
        // Fallback
        startTime = new Date().toISOString();
        endTime = new Date().toISOString();
      }

      return {
        calendarId: e.id,
        title: e.summary || 'Untitled Event',
        description: e.description,
        location: e.location,
        startTime,
        endTime,
        timezone: e.start.timeZone || 'UTC',
        allDay: !e.start.dateTime,
        status: e.status,
      };
    });

    const syncInput = {
      events: syncPayload,
      syncToken: nextSyncToken,
    };
    const syncUrl = `${env.MAIN_APP_URL}/api/trpc/events.syncFromCalendar?batch=1`;

    const syncResponse = await fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '0': {
          json: syncInput,
        },
      }),
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error('[SYNC] Failed:', errorText);
      throw new Error(`Sync failed: ${syncResponse.statusText}`);
    }

    console.log('[SYNC] Successfully synced', syncPayload.length, 'events');
  } catch (error: any) {
    console.error('[SYNC] Error:', error.message);
  }
};
