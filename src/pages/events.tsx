import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

interface EventsContent {
  title: string;
  openingCarnival: string;
  backLink: string;
}

import { LocaleSelect } from "~/components/LocaleSelect";
import fiContent from "~/locales/fi/events.json";
import enContent from "~/locales/en/events.json";

const fiContentTyped = fiContent as EventsContent;
const enContentTyped = enContent as EventsContent;

const EventsPage: NextPage = () => {
  const { locale } = useRouter();
  const content: EventsContent = locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <LocaleSelect />
        <h1 className="text-4xl font-extrabold tracking-tight text-oldschool-orange sm:text-[5rem]">
          {content.title}
        </h1>
        <ul className="pt-8 text-white text-sm w-5/6 text-center leading-relaxed">
          <li>03.08.2024 - HYTKY x Entropy @ Kallio Block Party</li>
          <li>02.09.2024 - HYY {content.openingCarnival}</li>
        </ul>
        <Link href="/">
          <p className="pt-8 text-white" role="button">{content.backLink}</p>
        </Link>
      </main>
    </>
  );
};

export default EventsPage;