import type { NextPage } from "next";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { LoginButton } from '@telegram-auth/react';
import { env } from 'src/env.mjs';

const SignInPage: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-5xl font-extrabold text-oldschool-orange pb-2">
          Jäsenten sisäänkirjautuminen
        </h1>
        <h2 className="text-2xl text-white pb-8">Vain jäsenille.</h2>
        <p className="list-disc text-white pb-8">Kirjautuaksesi, sinun on oltava HYTKY:n hallituksen tai aktiivien Telegram-ryhmässä.</p>
        <LoginButton
          botUsername={env.NEXT_PUBLIC_TG_BOT_NAME}
				  onAuthCallback={(data) => {
            // eslint-disable-next-line
            signIn('telegram-login', { callbackUrl: '/forum' }, data as any).catch((e) => {
              console.log("Virhe sisäänkirjautumisessa: ", e);
            });
          }}
        />
        <Link href="/">
          <p className="pt-6 text-white">← Takaisin</p>
        </Link>
      </main>
    </>
  );
};

export default SignInPage;