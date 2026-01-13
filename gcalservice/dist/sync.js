import { env } from './config.js';
import { syncEvents } from './google-calendar.js';
export const performSync = async () => {
  const startTime = Date.now();
  console.log('[SYNC] ═══════════════════════════════════════════');
  console.log('[SYNC] Starting calendar sync...');
  console.log('[SYNC] Timestamp:', new Date().toISOString());
  try {
    // 1. Fetch current sync state from main app
    console.log('[SYNC] Step 1: Fetching sync state from main app');
    const syncStateUrl = `${env.MAIN_APP_URL}/api/trpc/events.getSyncState`;
    console.log('[SYNC] URL:', syncStateUrl);
    console.log('[SYNC] Auth header present:', !!env.INTERNAL_API_SECRET);
    const syncStateResponse = await fetch(syncStateUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.INTERNAL_API_SECRET}`,
      },
    });
    console.log('[SYNC] Sync state response status:', syncStateResponse.status);
    console.log('[SYNC] Sync state response ok:', syncStateResponse.ok);
    if (!syncStateResponse.ok) {
      const errorText = await syncStateResponse.text();
      console.error('[SYNC] Failed to fetch sync state:', errorText);
      throw new Error(
        `Failed to fetch sync state: ${syncStateResponse.statusText}`
      );
    }
    const syncState = await syncStateResponse.json();
    const currentSyncToken = syncState?.result?.data?.syncToken;
    console.log(
      '[SYNC] Current sync token:',
      currentSyncToken || 'none (full sync)'
    );
    // 2. Fetch events from Google Calendar
    console.log('[SYNC] Step 2: Fetching events from Google Calendar');
    console.log(
      '[SYNC] Using sync token:',
      currentSyncToken ? 'yes (incremental)' : 'no (full sync)'
    );
    const { events, nextSyncToken, error } = await syncEvents(currentSyncToken);
    if (error) {
      console.error(
        '[SYNC] ❌ Error fetching events from Google Calendar:',
        error
      );
      // Post error to main app
      const errorUrl = `${env.MAIN_APP_URL}/api/trpc/events.recordSyncError?batch=1`;
      console.log('[SYNC] Recording error to:', errorUrl);
      const errorResponse = await fetch(errorUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.INTERNAL_API_SECRET}`,
        },
        body: JSON.stringify({
          0: {
            json: { error },
          },
        }),
      });
      console.log('[SYNC] Error recording status:', errorResponse.status);
      if (!errorResponse.ok) {
        const errorText = await errorResponse.text();
        console.error('[SYNC] Failed to record error:', errorText);
      }
      return;
    }
    console.log(
      '[SYNC] ✓ Fetched',
      events.length,
      'events from Google Calendar'
    );
    console.log('[SYNC] Next sync token:', nextSyncToken ? 'received' : 'none');
    // 3. Send events to main app for storage
    console.log('[SYNC] Step 3: Transforming events for storage');
    const syncPayload = events.map((e) => {
      // Convert to UTC ISO string format
      let startTime;
      let endTime;
      if (e.start.dateTime) {
        // Timed event - convert timezone-aware datetime to UTC
        startTime = new Date(e.start.dateTime).toISOString();
        endTime = new Date(e.end.dateTime).toISOString();
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
    console.log('[SYNC] ✓ Transformed', syncPayload.length, 'events');
    // Log event summaries for debugging
    if (syncPayload.length > 0) {
      console.log('[SYNC] Event summary:');
      syncPayload.slice(0, 3).forEach((e, i) => {
        console.log(`[SYNC]   ${i + 1}. ${e.title} (${e.startTime})`);
      });
      if (syncPayload.length > 3) {
        console.log(`[SYNC]   ... and ${syncPayload.length - 3} more`);
      }
    }
    console.log('[SYNC] Step 4: Sending events to main app');
    const syncInput = {
      events: syncPayload,
      syncToken: nextSyncToken,
    };
    const syncUrl = `${env.MAIN_APP_URL}/api/trpc/events.syncFromCalendar?batch=1`;
    console.log('[SYNC] URL:', syncUrl);
    console.log(
      '[SYNC] Payload size:',
      JSON.stringify(syncInput).length,
      'bytes'
    );
    const syncResponse = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.INTERNAL_API_SECRET}`,
      },
      body: JSON.stringify({
        0: {
          json: syncInput,
        },
      }),
    });
    console.log('[SYNC] Sync response status:', syncResponse.status);
    console.log('[SYNC] Sync response ok:', syncResponse.ok);
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error('[SYNC] ❌ Sync request failed:', errorText);
      throw new Error(`Sync failed: ${syncResponse.statusText}`);
    }
    const responseData = await syncResponse.json();
    console.log('[SYNC] ✓ Sync response:', JSON.stringify(responseData));
    const elapsed = Date.now() - startTime;
    console.log('[SYNC] ✅ Successfully synced', syncPayload.length, 'events');
    console.log('[SYNC] Total time:', elapsed, 'ms');
    console.log('[SYNC] ═══════════════════════════════════════════');
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[SYNC] ═══════════════════════════════════════════');
    console.error('[SYNC] ❌ SYNC FAILED');
    console.error('[SYNC] Error:', message);
    if (stack) {
      console.error('[SYNC] Stack trace:', stack);
    }
    console.error('[SYNC] Total time before failure:', elapsed, 'ms');
    console.error('[SYNC] ═══════════════════════════════════════════');
    // Re-throw to let caller handle
    throw error;
  }
};
