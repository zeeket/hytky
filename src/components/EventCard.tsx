import { type RouterOutputs } from '~/utils/api';
import { formatEventTimeRange } from '~/utils/dateFormat';

type Event = RouterOutputs['events']['getUpcoming'][number];

export type EventCardProps = {
  event: Event;
  locale: string;
};

export const EventCard = ({ event, locale }: EventCardProps) => {
  const dateTimeStr = formatEventTimeRange(
    event.startTime.toISOString(),
    event.endTime.toISOString(),
    event.timezone,
    locale,
    event.allDay
  );

  return (
    <li className="mb-4 rounded border border-gray-700 bg-gradient-to-r from-[#15162c] to-[#1a1b2e] p-4">
      <div className="mb-2 text-sm text-gray-400">{dateTimeStr}</div>
      <h3 className="mb-2 text-xl font-semibold text-oldschool-orange">
        {event.title}
      </h3>
      {event.description && (
        <p className="mb-2 text-gray-300">{event.description}</p>
      )}
      {event.location && (
        <div className="flex items-center text-sm text-gray-400">
          <span className="mr-2 font-semibold">Location:</span>
          <span>{event.location}</span>
        </div>
      )}
    </li>
  );
};
