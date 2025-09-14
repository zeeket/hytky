import { type NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import fiContent from '~/locales/fi/about.json';
import enContent from '~/locales/en/about.json';
import LocaleSelect from '~/components/LocaleSelect';
import Layout from '~/components/Layout';

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
    locale === 'fi' ? fiContentTyped : enContentTyped;
  return (
    <Layout title={content.title}>
      <LocaleSelect />
      <h1 className="text-oldschool-orange text-5xl font-extrabold tracking-tight italic sm:text-[5rem]">
        {content.title}
      </h1>
      <p className="p-6 text-2xl text-white">{content.description}</p>
      <div className="w-5/6 text-center text-base whitespace-pre-line text-white">
        {content.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <h3 className="text-oldschool-orange pt-6 font-extrabold sm:text-[3rem]">
        {content.clubRoomTitle}
      </h3>
      <p className="mx-2 text-center text-2xl text-white">{content.address}</p>
      <p className="text-1xl mx-2 text-center text-white">{content.doorbell}</p>
      <Link
        href="/"
        className="hover:bg-newschool-orange mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
      >
        {content.backLink}
      </Link>
    </Layout>
  );
};

export default About;
