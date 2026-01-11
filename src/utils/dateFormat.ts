import { format, parseISO } from 'date-fns';
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
    return format(date, 'PP', { locale: localeObj });
  }

  return formatInTimeZone(
    date,
    timezone,
    'PPp',
    { locale: localeObj }
  );
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
  const endTime = formatInTimeZone(
    parseISO(end),
    timezone,
    'p',
    { locale: locale === 'fi' ? fi : enUS }
  );

  return `${startFormatted} - ${endTime}`;
};
