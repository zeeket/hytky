import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import LocaleSelect from "~/components/LocaleSelect";
import fiContent from "~/locales/fi/events.json";
import enContent from "~/locales/en/events.json";
import Layout from "~/components/Layout";

interface EventsContent {
  title: string;
  openingCarnival: string;
  newcomersNight: string;
  backLink: string;
}

const fiContentTyped = fiContent as EventsContent;
const enContentTyped = enContent as EventsContent;

const EventsPage: NextPage = () => {
  const { locale } = useRouter();
  const content: EventsContent = locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <Layout title={"HYTKY ".concat(content.title)}>
        <LocaleSelect />
        <h1 className="text-4xl font-extrabold tracking-tight text-oldschool-orange sm:text-[5rem]">
          {content.title}
        </h1>
        <ul className="pt-8 text-white text-sm w-5/6 text-center leading-relaxed">
          <li>02.09.2024 - HYY {content.openingCarnival}</li>
          <li>11.10.2024 - {content.newcomersNight}</li>
        </ul>
        <Link href="/" className="mt-8 text-center p-3 rounded-lg w-40 h-12 bg-white/10 text-white transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-newschool-orange duration-300">
          {content.backLink}
        </Link>
      </Layout>
  );
};

export default EventsPage;