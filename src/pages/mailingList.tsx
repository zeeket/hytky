import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { LocaleSelect } from "~/components/LocaleSelect";
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

import fiContent from "~/locales/fi/mailingList.json";
import enContent from "~/locales/en/mailingList.json";

const fiContentTyped = fiContent as MailingListContent;
const enContentTyped = enContent as MailingListContent;

const MailingListPage: NextPage = () => {
  const { locale } = useRouter();
  const content: MailingListContent =
    locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
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
        <Link href="/">
          <p className="pt-8 text-white" role="button">{content.backLink}</p>
        </Link>
      </main>
    </>
  );
};

export default MailingListPage;
