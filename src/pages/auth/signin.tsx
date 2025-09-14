import type { NextPage } from 'next';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

import { LoginButton } from '@telegram-auth/react';
import { env } from 'src/env.mjs';
import Layout from '~/components/Layout';

const SignInPage: NextPage = () => {
  return (
    <Layout title="HYTKY Kirjaudu sisään">
      <h1 className="text-oldschool-orange pb-2 text-center text-3xl font-extrabold">
        Jäsenten sisäänkirjautuminen
      </h1>
      <h2 className="pb-8 text-2xl text-white">Vain jäsenille.</h2>
      <p className="mx-2 list-disc pb-8 text-pretty text-white">
        Kirjautuaksesi, sinun on oltava HYTKY:n hallituksen tai aktiivien
        Telegram-ryhmässä.
      </p>
      <LoginButton
        botUsername={env.NEXT_PUBLIC_TG_BOT_NAME}
        onAuthCallback={(data) => {
          signIn(
            'telegram-login',
            { callbackUrl: '/forum' },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data as any
          ).catch((e) => {
            console.log('Virhe sisäänkirjautumisessa: ', e);
          });
        }}
      />
      <Link
        href="/"
        className="hover:bg-newschool-orange mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
      >
        ← Takaisin
      </Link>
    </Layout>
  );
};

export default SignInPage;
