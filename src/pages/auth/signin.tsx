import type { NextPage } from "next";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { LoginButton } from '@telegram-auth/react';
import { env } from 'src/env.mjs';
import Layout from "~/components/Layout";

const SignInPage: NextPage = () => {
  return (
    <Layout title="HYTKY Kirjaudu sisään">
        <h1 className="text-3xl font-extrabold text-oldschool-orange pb-2 text-center">
          Jäsenten sisäänkirjautuminen
        </h1>
        <h2 className="text-2xl text-white pb-8">Vain jäsenille.</h2>
        <p className="list-disc text-white pb-8 mx-2 text-pretty">Kirjautuaksesi, sinun on oltava HYTKY:n hallituksen tai aktiivien Telegram-ryhmässä.</p>
        <LoginButton
          botUsername={env.NEXT_PUBLIC_TG_BOT_NAME}
				  onAuthCallback={(data) => {
            // eslint-disable-next-line
            signIn('telegram-login', { callbackUrl: '/forum' }, data as any).catch((e) => {
              console.log("Virhe sisäänkirjautumisessa: ", e);
            });
          }}
        />
        <Link href="/" className="mt-8 text-center p-3 rounded-lg w-40 h-12 bg-white/10 text-white transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-newschool-orange duration-300">
          ← Takaisin
        </Link>
      </Layout>
  );
};

export default SignInPage;