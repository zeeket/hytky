import { google } from 'googleapis';
import { env } from './config.js';
export const createCalendarClient = () => {
    const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, 'http://localhost');
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
        console.log('[GOOGLE] Sync token:', syncToken ? 'using existing' : 'none (full sync)');
        const allEvents = [];
        let pageToken = undefined;
        let nextSyncToken = undefined;
        let pageNumber = 1;
        do {
            const requestParams = {
                calendarId: env.GOOGLE_CALENDAR_ID,
                syncToken: syncToken,
                pageToken: pageToken,
                maxResults: 2500,
                singleEvents: true,
                orderBy: syncToken ? undefined : 'startTime',
                timeMin: syncToken ? undefined : new Date().toISOString(),
            };
            console.log(`[GOOGLE] Request params (page ${pageNumber}):`, JSON.stringify(requestParams, null, 2));
            const response = (await calendar.events.list(requestParams));
            const pageEvents = (response.data?.items || []);
            allEvents.push(...pageEvents);
            console.log(`[GOOGLE] ✓ Page ${pageNumber} successful: ${pageEvents.length} events`);
            console.log(`[GOOGLE] Total events so far: ${allEvents.length}`);
            // Check for next page
            pageToken = response.data?.nextPageToken ?? undefined;
            if (pageToken) {
                console.log(`[GOOGLE] More pages available, fetching page ${pageNumber + 1}...`);
                pageNumber++;
            }
            else {
                // Only set nextSyncToken on the final page
                nextSyncToken = response.data?.nextSyncToken ?? undefined;
                console.log('[GOOGLE] Final page reached. Next sync token:', nextSyncToken ? 'provided' : 'none');
            }
        } while (pageToken);
        console.log(`[GOOGLE] ✓ All pages fetched. Total events: ${allEvents.length}`);
        return {
            events: allEvents,
            nextSyncToken,
        };
    }
    catch (error) {
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
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 410) {
            console.warn('[GOOGLE] Sync token expired (410), performing full sync...');
            return syncEvents();
        }
        return {
            events: [],
            error: message,
        };
    }
};
