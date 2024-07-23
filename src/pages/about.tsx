import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

interface AboutContent {
  title: string;
  description: string;
  content: string[];
  clubRoomTitle: string;
  address: string;
  doorbell: string;
  backLink: string;
}

import fiContent from "~/locales/fi/about.json";
import enContent from "~/locales/en/about.json";
import { LocaleSelect } from "~/components/LocaleSelect";

const fiContentTyped = fiContent as AboutContent;
const enContentTyped = enContent as AboutContent;

const About: NextPage = () => {
  const { locale } = useRouter();
  const content: AboutContent =
    locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <LocaleSelect />
        <h1 className="text-5xl font-extrabold italic tracking-tight text-oldschool-orange sm:text-[5rem]">
          {content.title}
        </h1>
        <p className="p-6 text-2xl text-white">{content.description}</p>
        <div className="w-5/6 whitespace-pre-line text-center text-base text-white">
          {content.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <h3 className="pt-6 font-extrabold text-oldschool-orange sm:text-[3rem]">
          {content.clubRoomTitle}
        </h3>
        <p className="text-center text-2xl text-white">
          {content.address}
        </p>
        <p className="text-1xl text-center text-white">
          {content.doorbell}
        </p>
        <Link href="/">
          <p className="pt-8 text-white" role="button">
            {content.backLink}
          </p>
        </Link>
      </main>
    </>
  );
};

export default About;
