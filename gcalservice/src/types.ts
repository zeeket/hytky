export type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status: string;
};

export type SyncResult = {
  events: CalendarEvent[];
  nextSyncToken?: string;
  error?: string;
};

export type SyncEventPayload = {
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  allDay: boolean;
  status: string;
};
