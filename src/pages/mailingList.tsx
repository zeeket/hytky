import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import LocaleSelect from '~/components/LocaleSelect';
import Layout from '~/components/Layout';

import fiContent from '~/locales/fi/mailingList.json';
import enContent from '~/locales/en/mailingList.json';
interface MailingListContent {
  title: string;
  joiningTitle: string;
  intro: string;
  toRobot: string;
  emailSubject: string;
  leavingTitle: string;
  leavingIntro: string;
  sameAddress: string;
  backLink: string;
}

const fiContentTyped = fiContent as MailingListContent;
const enContentTyped = enContent as MailingListContent;

const MailingListPage: NextPage = () => {
  const { locale } = useRouter();
  const content: MailingListContent =
    locale === 'fi' ? fiContentTyped : enContentTyped;
  return (
    <Layout title={'HYTKY '.concat(content.title)}>
      <LocaleSelect />
      <h1 className="text-oldschool-orange pb-2 text-5xl font-extrabold">
        {content.title}
      </h1>
      <h2 className="p-6 text-2xl text-white underline">
        {content.joiningTitle}
      </h2>
      <p className="pb-1 text-center text-white">
        {content.intro}
        <br></br>
        <span className="py-2 font-mono text-white">
          {' '}
          subscribe hytky-lista
        </span>{' '}
        <br></br>
        {content.toRobot}{' '}
        <span className="px-2 font-mono">majordomo@helsinki.fi</span> <br></br>
        {content.emailSubject}
      </p>

      <h2 className="p-6 text-2xl text-white underline">
        {content.leavingTitle}
      </h2>
      <p className="pb-1 text-center text-white">
        {content.leavingIntro}
        <br></br>
        <span className="py-2 font-mono text-white">
          {' '}
          unsubscribe hytky-lista{' '}
        </span>{' '}
        <br></br>
        {content.toRobot}{' '}
        <span className="px-2 font-mono">majordomo@helsinki.fi</span>{' '}
        {content.sameAddress}
        <br></br>
        {content.emailSubject}
      </p>
      <Link
        href="/"
        className="hover:bg-newschool-orange mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
      >
        {content.backLink}
      </Link>
    </Layout>
  );
};

export default MailingListPage;
