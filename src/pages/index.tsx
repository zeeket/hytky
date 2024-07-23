import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";

import HytkyLogo from "../../public/hytkylogo.svg";
import FacebookLogo from "../../public/facebook.svg";
import InstagramLogo from "../../public/instagram.svg";
import SoundcloudLogo from "../../public/soundcloud.svg";
import MailIcon from "../../public/mail.svg";
import Miukumauku from "../../public/miukumauku2.svg";

import { api } from "~/utils/api";

interface IndexContent {
  FollowUs: string;
  AskUsingEmail: string;
  MailingListTitle: string;
  MailingListText: string;
  UpcomingEvents: string;
  AboutUsText: string;
  RentalTitle: string;
  RentalText: string;
  SignIn: string;
  SignOut: string;
  LoggedInAs: string;
  Loading: string;
}

import { LocaleSelect } from "~/components/LocaleSelect";
import fiContent from "~/locales/fi/index.json";
import enContent from "~/locales/en/index.json";

const fiContentTyped = fiContent as IndexContent;
const enContentTyped = enContent as IndexContent;

const Home: NextPage = () => {
  const { locale } = useRouter();
  const content: IndexContent = locale === "fi" ? fiContentTyped : enContentTyped;

  const hello = api.index.hello.useQuery();

  return (
    <>
      <Head>
        <title>HYTKY</title>
        <meta
          name="description"
          content="Helsingin Yliopiston Teknokulttuurin Ystävät"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
      <LocaleSelect />
        <div className="container flex flex-col items-center justify-center space-y-3">
          <HytkyLogo className="scale-90" alt="HYTKY" />
          <div className="justify-center border-2 border-dotted border-orange-600 text-center">
            <h2 className="text-xs tracking-tight text-white">{content.FollowUs}</h2>
            <div className="flex flex-row gap-4 px-2">
              <a
                href="https://www.facebook.com/hytky/"
                target="_blank"
                rel="noreferrer"
              >
                <FacebookLogo width={25} height={25} alt="Facebook" />
              </a>
              <a
                href="https://www.instagram.com/hytkyry/"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramLogo width={25} height={25} alt="Instagram" />
              </a>
              <a
                href="https://www.soundcloud.com/hytkyry"
                target="_blank"
                rel="noreferrer"
              >
                <SoundcloudLogo width={25} height={25} alt="SoundCloud" />
              </a>
            </div>
          </div>
          <span className="inline-block text-white">
            {" "}
            <MailIcon width={20} height={20} className="inline-block" />
            <span className="pl-2 tracking-tight text-white">
              {content.AskUsingEmail}: hytky
              <Miukumauku width={15} height={15} className="inline-block" />
              hytky.org
            </span>
          </span>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 md:gap-10">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/mailingList"
            >
              <h3 className="whitespace-normal break-words text-2xl font-bold">
                {content.MailingListTitle}
              </h3>
              <div className="text-lg">
                {content.MailingListText}
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/events"
            >
              <h3 className="py-4 text-2xl font-bold">
                {content.UpcomingEvents}
              </h3>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/about"
            >
              <h3 className="text-2xl font-bold italic">HYTKY? →</h3>
              <div className="text-lg">{content.AboutUsText}</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/rental"
            >
              <h3 className="text-2xl font-bold">{content.RentalTitle}</h3>
              <div className="text-lg">{content.RentalText}</div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-2xl text-white">
              {hello.data ? hello.data.greeting : content.Loading}
            </p>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.index.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  const { locale } = useRouter();
  const content: IndexContent = locale === "fi" ? fiContentTyped : enContentTyped;

  return (
    <div className="flex flex-col items-center justify-center pt-2">
      <p className="text-center text-2xl text-white">
        {sessionData && (
          <span>{content.LoggedInAs} {sessionData.user?.name}</span>
        )}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? content.SignOut : content.SignIn }
      </button>
    </div>
  );
};
