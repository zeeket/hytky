import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

import Layout from '~/components/Layout';

/**
 * NextAuth reports login failures by redirecting back here with an `error`
 * query parameter (see `pages.error` in `src/server/auth.ts`).
 *
 * @see https://next-auth.js.org/configuration/pages#error-codes
 */
const errorMessage = (error: string | string[] | undefined): string | null => {
  if (!error) return null;
  if (error === 'AccessDenied') {
    return 'Sinulla ei ole oikeutta kirjautua sisään. Varmista, että olet HYTKY:n hallituksen tai aktiivien Telegram-ryhmässä.';
  }
  return 'Sisäänkirjautuminen ei onnistunut. Yritä hetken kuluttua uudelleen.';
};

const SignInPage: NextPage = () => {
  const { error } = useRouter().query;
  const message = errorMessage(error);

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
      {message && (
        <p
          role="alert"
          className="text-oldschool-orange mx-2 pb-8 text-center text-pretty"
        >
          {message}
        </p>
      )}
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => {
          // Sends the browser to Telegram's OpenID Connect authorization
          // endpoint; the ID token is exchanged and verified server-side.
          signIn('telegram', { callbackUrl: '/forum' }).catch((e) => {
            console.log('Virhe sisäänkirjautumisessa: ', e);
          });
        }}
      >
        Kirjaudu Telegramilla
      </button>
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
