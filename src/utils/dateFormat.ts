import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { enUS, fi } from 'date-fns/locale';

export const formatEventDate = (
  dateString: string,
  timezone: string,
  locale: string,
  allDay: boolean = false
): string => {
  const date = parseISO(dateString);
  const localeObj = locale === 'fi' ? fi : enUS;

  if (allDay) {
    return formatInTimeZone(date, timezone, 'PP', { locale: localeObj });
  }

  return formatInTimeZone(date, timezone, 'PPp', { locale: localeObj });
};

export const formatEventTimeRange = (
  start: string,
  end: string,
  timezone: string,
  locale: string,
  allDay: boolean = false
): string => {
  if (allDay) {
    return formatEventDate(start, timezone, locale, true);
  }

  const startFormatted = formatEventDate(start, timezone, locale, false);
  const endTime = formatInTimeZone(parseISO(end), timezone, 'p', {
    locale: locale === 'fi' ? fi : enUS,
  });

  return `${startFormatted} - ${endTime}`;
};

/**
 * Calculate time until end of event and format it as "X minutes" or "X hours"
 * @param endTime - ISO string of event end time
 * @param locale - Locale string ('en' or 'fi')
 * @returns Formatted string like "30 minutes" or "2 hours" or null if event has ended
 */
export const formatTimeUntilEnd = (
  endTime: string,
  locale: string
): string | null => {
  const end = parseISO(endTime);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) {
    return null; // Event has ended
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours >= 1) {
    const remainingMinutes = diffMinutes % 60;
    if (locale === 'fi') {
      if (remainingMinutes === 0) {
        return diffHours === 1 ? '1 tunti' : `${diffHours} tuntia`;
      }
      return `${diffHours} tunti${diffHours > 1 ? 'a' : ''} ${remainingMinutes} minuuttia`;
    } else {
      if (remainingMinutes === 0) {
        return diffHours === 1 ? '1 hour' : `${diffHours} hours`;
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }
  } else {
    if (locale === 'fi') {
      return diffMinutes === 1 ? '1 minuutti' : `${diffMinutes} minuuttia`;
    } else {
      return diffMinutes === 1 ? '1 minute' : `${diffMinutes} minutes`;
    }
  }
};
