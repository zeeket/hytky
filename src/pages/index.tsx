import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import HytkyLogo from "../../public/hytkylogo.svg";
import FacebookLogo from "../../public/facebook.svg";
import InstagramLogo from "../../public/instagram.svg";
import SoundcloudLogo from "../../public/soundcloud.svg";
import MailIcon from "../../public/mail.svg";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>HYTKY</title>
        <meta name="description" content="Helsingin Yliopiston Teknokulttuurin Ystävät" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">

         <HytkyLogo/>

          <div className="justify-center border-2 border-dotted border-orange-600 text-center">
            <h2 className="text-xs tracking-tight text-white">Seuraa meitä</h2>
            <div className="flex flex-row gap-4 pr-1">
              <a
                href="https://www.facebook.com/hytky/"
                target="_blank"
                rel="noreferrer"
              >
                <FacebookLogo width={25} height={25}/>
              </a>
              <a
                href="https://www.instagram.com/hytkyry/"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramLogo width={25} height={25}/>
              </a>
              <a
                href="https://www.soundcloud.com/hytkyry"
                target="_blank"
                rel="noreferrer"
              >
                <SoundcloudLogo width={25} height={25}/>
              </a>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
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

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
