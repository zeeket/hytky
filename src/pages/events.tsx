import { type NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import LocaleSelect from '~/components/LocaleSelect';
import { EventCard } from '~/components/EventCard';
import fiContent from '~/locales/fi/events.json';
import enContent from '~/locales/en/events.json';
import Layout from '~/components/Layout';
import { api } from '~/utils/api';

interface EventsContent {
  title: string;
  loading: string;
  error: string;
  checkBackSoon: string;
  backLink: string;
  location: string;
  happeningNow: string;
  estimatedUntilEnd: string;
}

const fiContentTyped = fiContent as EventsContent;
const enContentTyped = enContent as EventsContent;

const EventsPage: NextPage = () => {
  const { locale } = useRouter();
  const content: EventsContent =
    locale === 'fi' ? fiContentTyped : enContentTyped;

  const {
    data: events,
    isLoading,
    error,
  } = api.events.getUpcoming.useQuery({
    limit: 20,
    includeAllDay: true,
  });

  return (
    <Layout title={'HYTKY '.concat(content.title)}>
      <LocaleSelect />
      <h1 className="text-oldschool-orange text-4xl font-extrabold tracking-tight sm:text-[5rem]">
        {content.title}
      </h1>

      <div className="w-5/6 pt-8">
        {isLoading && (
          <p className="text-center text-gray-400">{content.loading}</p>
        )}

        {error && <p className="text-center text-red-400">{content.error}</p>}

        {events && events.length === 0 && (
          <p className="text-center text-gray-400">{content.checkBackSoon}</p>
        )}

        {events && events.length > 0 && (
          <ul className="text-left">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                locale={locale || 'en'}
                locationLabel={content.location}
                happeningNowLabel={content.happeningNow}
                estimatedUntilEndLabel={content.estimatedUntilEnd}
              />
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/"
        className="hover:bg-newschool-orange mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
      >
        {content.backLink}
      </Link>
    </Layout>
  );
};

export default EventsPage;
