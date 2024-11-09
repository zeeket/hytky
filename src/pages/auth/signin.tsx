import type { NextPage } from 'next';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

import { LoginButton } from '@telegram-auth/react';
import { env } from 'src/env.mjs';
import Layout from '~/components/Layout';

const SignInPage: NextPage = () => {
  return (
    <Layout title="HYTKY Kirjaudu sisään">
      <h1 className="pb-2 text-center text-3xl font-extrabold text-oldschool-orange">
        Jäsenten sisäänkirjautuminen
      </h1>
      <h2 className="pb-8 text-2xl text-white">Vain jäsenille.</h2>
      <p className="mx-2 list-disc text-pretty pb-8 text-white">
        Kirjautuaksesi, sinun on oltava HYTKY:n hallituksen tai aktiivien
        Telegram-ryhmässä.
      </p>
      <LoginButton
        botUsername={env.NEXT_PUBLIC_TG_BOT_NAME}
        onAuthCallback={(data) => {
          // eslint-disable-next-line
          signIn(
            'telegram-login',
            { callbackUrl: '/forum' },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            data as any
          ).catch((e) => {
            console.log('Virhe sisäänkirjautumisessa: ', e);
          });
        }}
      />
      <Link
        href="/"
        className="mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-newschool-orange"
      >
        ← Takaisin
      </Link>
    </Layout>
  );
};

export default SignInPage;
