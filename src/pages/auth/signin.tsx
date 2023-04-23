import type { NextPage } from "next";
import Link from "next/link";
import { signIn, getCsrfToken} from "next-auth/react";

import { LoginButton } from '@telegram-auth/react';
import { env } from 'src/env.mjs';

const SignInPage: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-5xl font-extrabold text-oldschool-orange pb-2">
          Kirjaudu foorumille
        </h1>
        <h2 className="text-2xl text-white">Vain jäsenille.</h2>
        <p className="list-disc text-white pb-1">Kirjautuaksesi, sinut on oltava lisätty HYTKY:n hallituksen tai aktiivien Telegram-ryhmään.</p>
        <LoginButton
          botUsername={env.NEXT_PUBLIC_TG_BOT_NAME}
				  onAuthCallback={(data) => {
            console.log("data ", data);
            signIn('telegram-login', { callbackUrl: '/forum' }, data as any);
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