import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import fiContent from "~/locales/fi/about.json";
import enContent from "~/locales/en/about.json";
import LocaleSelect from "~/components/LocaleSelect";
import Layout from "~/components/Layout";

interface AboutContent {
  title: string;
  description: string;
  content: string[];
  clubRoomTitle: string;
  address: string;
  doorbell: string;
  backLink: string;
}

const fiContentTyped = fiContent as AboutContent;
const enContentTyped = enContent as AboutContent;

const About: NextPage = () => {
  const { locale } = useRouter();
  const content: AboutContent =
    locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <Layout title={content.title}>
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
        <p className="text-center text-2xl text-white mx-2">
          {content.address}
        </p>
        <p className="text-1xl text-center text-white mx-2">
          {content.doorbell}
        </p>
        <Link href="/" className="mt-8 text-center p-3 rounded-lg w-40 h-12 bg-white/10 text-white transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-newschool-orange duration-300">
            {content.backLink}
        </Link>
      </Layout>
  );
};

export default About;
