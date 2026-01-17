import { type RouterOutputs } from '~/utils/api';
import { formatEventTimeRange, formatTimeUntilEnd } from '~/utils/dateFormat';

type Event = RouterOutputs['events']['getUpcoming'][number];

export type EventCardProps = {
  event: Event;
  locale: string;
  locationLabel: string;
  happeningNowLabel: string;
  estimatedUntilEndLabel: string;
};

export const EventCard = ({
  event,
  locale,
  locationLabel,
  happeningNowLabel,
  estimatedUntilEndLabel,
}: EventCardProps) => {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const isOngoing = startTime <= now && endTime >= now;

  const dateTimeStr = formatEventTimeRange(
    event.startTime.toISOString(),
    event.endTime.toISOString(),
    event.timezone,
    locale,
    event.allDay
  );

  const timeUntilEnd = isOngoing
    ? formatTimeUntilEnd(event.endTime.toISOString(), locale)
    : null;

  return (
    <li className="mb-4 rounded border border-gray-700 bg-gradient-to-r from-[#15162c] to-[#1a1b2e] p-4">
      <div className="mb-2 text-sm text-gray-400">{dateTimeStr}</div>
      {isOngoing && (
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-green-600/20 px-2 py-1 text-xs font-semibold text-green-400">
            {happeningNowLabel}
          </span>
          {timeUntilEnd && (
            <span className="text-sm text-gray-300">
              {estimatedUntilEndLabel.replace('{time}', timeUntilEnd)}
            </span>
          )}
        </div>
      )}
      <h3 className="text-oldschool-orange mb-2 text-xl font-semibold">
        {event.title}
      </h3>
      {event.description && (
        <p className="mb-2 text-gray-300">{event.description}</p>
      )}
      {event.location && (
        <div className="flex items-center text-sm text-gray-400">
          <span className="mr-2 font-semibold">{locationLabel}</span>
          <span>{event.location}</span>
        </div>
      )}
    </li>
  );
};
