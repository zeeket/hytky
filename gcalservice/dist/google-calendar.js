import { google } from 'googleapis';
import { env } from './config.js';
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
export const syncEvents = async (syncToken) => {
  console.log('[GOOGLE] Creating calendar client...');
  const calendar = createCalendarClient();
  try {
    console.log('[GOOGLE] Requesting events from Google Calendar API');
    console.log('[GOOGLE] Calendar ID:', env.GOOGLE_CALENDAR_ID);
    console.log(
      '[GOOGLE] Sync token:',
      syncToken ? 'using existing' : 'none (full sync)'
    );
    const requestParams = {
      calendarId: env.GOOGLE_CALENDAR_ID,
      syncToken: syncToken,
      maxResults: 2500,
      singleEvents: true,
      orderBy: syncToken ? undefined : 'startTime',
      timeMin: syncToken ? undefined : new Date().toISOString(),
    };
    console.log(
      '[GOOGLE] Request params:',
      JSON.stringify(requestParams, null, 2)
    );
    const response = await calendar.events.list(requestParams);
    console.log('[GOOGLE] ✓ API request successful');
    console.log('[GOOGLE] Events received:', response.data.items?.length || 0);
    console.log(
      '[GOOGLE] Next sync token:',
      response.data.nextSyncToken ? 'provided' : 'none'
    );
    return {
      events: response.data.items || [],
      nextSyncToken: response.data.nextSyncToken ?? undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GOOGLE] ❌ API error:', message);
    // Log additional error details
    if (typeof error === 'object' && error !== null) {
      if ('code' in error) {
        console.error('[GOOGLE] Error code:', error.code);
      }
      if ('errors' in error) {
        console.error('[GOOGLE] Error details:', JSON.stringify(error.errors));
      }
    }
    // Handle sync token expiration (410 error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 410
    ) {
      console.warn(
        '[GOOGLE] Sync token expired (410), performing full sync...'
      );
      return syncEvents();
    }
    return {
      events: [],
      error: message,
    };
  }
};
