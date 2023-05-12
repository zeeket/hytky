import { type NextPage } from "next";
import Link from "next/link";

const About: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-5xl font-extrabold italic tracking-tight text-oldschool-orange sm:text-[5rem]">
          HYTKY?
        </h1>
        <p className="text-2xl text-white p-6">
          Helsingin yliopiston teknokulttuurin ystävät ry
        </p>
        <p className="text-2xl text-white">DIY techno culture since 1996</p>
        <h3 className="font-extrabold text-oldschool-orange sm:text-[3rem] pt-6">
          Kerhohuone
        </h3>
        <p className="text-2xl text-white">
          Domus Gaudium, Leppäsuonkatu 11, 00100 Helsinki
        </p>
        <p className="text-1xl text-white">
          Ovisummeri: Ulrika. Portaat alas tai hissillä kerrokseen -1. Tila on
          esteetön.
        </p>
        <Link href="/">
          <p className="pt-8 text-white">← Takaisin</p>
        </Link>
      </main>
    </>
  );
};

export default About;