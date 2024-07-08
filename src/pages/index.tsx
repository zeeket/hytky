import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

import HytkyLogo from "../../public/hytkylogo.svg";
import FacebookLogo from "../../public/facebook.svg";
import InstagramLogo from "../../public/instagram.svg";
import SoundcloudLogo from "../../public/soundcloud.svg";
import MailIcon from "../../public/mail.svg";
import Miukumauku from "../../public/miukumauku2.svg";
import happotesti from "public/event/06-05-2023-happotesti.jpg";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery();

  return (
    <>
      <Head>
        <title>HYTKY</title>
        <meta name="description" content="Helsingin Yliopiston Teknokulttuurin Ystävät" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center space-y-8">
        <HytkyLogo className="scale-90"/>
          <div className="justify-center border-2 border-dotted border-orange-600 text-center">
            <h2 className="text-xs tracking-tight text-white">Seuraa meitä</h2>
            <div className="flex flex-row gap-4 px-2">
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
          <span className="inline-block text-white"> <MailIcon width={20} height={20} className="inline-block"/>
            <span className="pl-2 tracking-tight text-white">
              Kysy sähköpostilla: hytky
              <Miukumauku width={15} height={15} className="inline-block"/>
              hytky.org
            </span>
          </span>
{/*           <Link
              className="flex max-w flex-col gap-4 rounded-xl p-4 text-center text-white hover:bg-white/20"
              href="https://entropy.fi/2023/happotesti"
            >      
            <div style={{ width: '100%', display: 'inline-flex' }}>
              <Image src={happotesti} alt="Event poster for Happotesti event." placeholder="blur" style={{ width: '30%', objectFit:'cover', margin: 'auto' }}/>
              </div>
              <h3 className="text-2xl font-bold">Happotesti →</h3>
              <div className="text-lg">Tuleva tapahtuma 06.05.23 feat. HYTKY:n oma Tuomas G</div>
            </Link> */}
          <div className="grid md:grid-cols-2 gap-4 sm:grid-cols-1 md:gap-10">
          <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/mailingList"
            >
              <h3 className="text-2xl font-bold whitespace-normal break-words">Sähköpostilista →</h3>
              <div className="text-lg">Näin liityt ja poistut sähköpostilistalta.</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20 justify-center"
              href="/eventArchive"
            >
              <h3 className="text-2xl font-bold">Tulevat tapahtumat →</h3>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/about"
            >
              <h3 className="text-2xl font-bold italic">HYTKY? →</h3>
              <div className="text-lg">Mikä on HYTKY?</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-center text-white hover:bg-white/20"
              href="/rental"
            >
              <h3 className="text-2xl font-bold">Vuokraus →</h3>
              <div className="text-lg">Tietoa laitteiden vuokrauksesta.</div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white text-center">
              {hello.data ? hello.data.greeting : "Ladataan..."}
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
    <div className="flex flex-col items-center justify-center pt-2">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Kirjautunut käyttäjänä {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Kirjaudu ulos" : "Kirjaudu sisään (jäsenille)"}
      </button>
    </div>
  );
};
