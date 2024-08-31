import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import LocaleSelect from "~/components/LocaleSelect";
import Layout from "~/components/Layout";

import fiContent from "~/locales/fi/mailingList.json";
import enContent from "~/locales/en/mailingList.json";
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
    locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <Layout title={"HYTKY ".concat(content.title)}>
        <LocaleSelect />
        <h1 className="text-5xl font-extrabold text-oldschool-orange pb-2">
          {content.title}
        </h1>
        <h2 className="text-2xl text-white underline p-6">{content.joiningTitle}</h2>
        <p className="text-white pb-1 text-center">
            {content.intro}<br></br>
            <span className="text-white font-mono py-2"> subscribe hytky-lista</span> <br></br>  
            {content.toRobot} <span className="font-mono px-2">majordomo@helsinki.fi</span> <br></br> 
            {content.emailSubject}
        </p>
              
        <h2 className="text-white text-2xl underline p-6">{content.leavingTitle}</h2>
        <p className="text-white pb-1 text-center">{content.leavingIntro}<br></br>
            <span className="text-white font-mono py-2"> unsubscribe hytky-lista </span> <br></br>
            {content.toRobot} <span className="font-mono px-2">majordomo@helsinki.fi</span> {content.sameAddress}<br></br>
            {content.emailSubject}
        </p>
        <Link href="/" className="mt-8 text-center p-3 rounded-lg w-40 h-12 bg-white/10 text-white transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-newschool-orange duration-300">
          {content.backLink}
        </Link>
      </Layout>
  );
};

export default MailingListPage;
