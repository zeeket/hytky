import Link from 'next/link';
import { type NextPage } from 'next/types';

const FourOhFour: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-oldschool-orange pb-2 text-5xl font-extrabold">
          404: Sivua ei löytynyt
        </h1>
        <p className="text-white">Miksi teknobileiden sivu sai 404-errorin?</p>
        <p className="text-white">
          Koska se oli niin UG, että vain muutama tietää sen osoitteen!
        </p>
        <Link href="/" className="pt-6 text-white">
          ← Takaisin
        </Link>
      </main>
    </>
  );
};

export default FourOhFour;
