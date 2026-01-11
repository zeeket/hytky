import { google } from 'googleapis';
import { env } from './config.js';
import type { CalendarEvent, SyncResult } from './types.js';

export const createCalendarClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    'http://localhost'
  );

  oauth2Client.setCredentials({
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

export const syncEvents = async (syncToken?: string): Promise<SyncResult> => {
  const calendar = createCalendarClient();

  try {
    const response = await calendar.events.list({
      calendarId: env.GOOGLE_CALENDAR_ID,
      syncToken: syncToken,
      maxResults: 2500,
      singleEvents: true,
      orderBy: syncToken ? undefined : 'startTime',
      timeMin: syncToken ? undefined : new Date().toISOString(),
    });

    return {
      events: (response.data.items as CalendarEvent[]) || [],
      nextSyncToken: response.data.nextSyncToken ?? undefined,
    };
  } catch (error: any) {
    console.error('[GOOGLE] API error:', error.message);

    if (error.code === 410) {
      console.warn('[GOOGLE] Sync token expired, performing full sync');
      return syncEvents();
    }

    return {
      events: [],
      error: error.message || 'Unknown error',
    };
  }
};
