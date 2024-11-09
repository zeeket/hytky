import { type NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import LocaleSelect from '~/components/LocaleSelect';
import fiContent from '~/locales/fi/events.json';
import enContent from '~/locales/en/events.json';
import Layout from '~/components/Layout';

interface EventsContent {
  title: string;
  openingCarnival: string;
  newcomersNight: string;
  checkBackSoon: string;
  backLink: string;
  beforeConeheadLink: string;
  conehead: string;
  afterConeheadLink: string;
  clubroom: string;
}

const fiContentTyped = fiContent as EventsContent;
const enContentTyped = enContent as EventsContent;

const EventsPage: NextPage = () => {
  const { locale } = useRouter();
  const content: EventsContent =
    locale === 'fi' ? fiContentTyped : enContentTyped;
  return (
    <Layout title={'HYTKY '.concat(content.title)}>
      <LocaleSelect />
      <h1 className="text-4xl font-extrabold tracking-tight text-oldschool-orange sm:text-[5rem]">
        {content.title}
      </h1>
      <ul className="w-5/6 pt-8 text-center text-sm leading-relaxed text-white">
        <li>
          {content.beforeConeheadLink}
          <Link href="https://freepartypeople.wordpress.com/">
            <span className="text-oldschool-orange hover:underline">
              {content.conehead}
            </span>
          </Link>
          {content.afterConeheadLink}
          <Link href="/about">
            <span className="text-oldschool-orange hover:underline">
              {content.clubroom}
            </span>
          </Link>
        </li>
      </ul>
      <Link
        href="/"
        className="mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-newschool-orange"
      >
        {content.backLink}
      </Link>
    </Layout>
  );
};

export default EventsPage;
