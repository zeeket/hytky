import { type NextPage } from "next";
import Link from "next/link";

const EventArchive: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-4xl font-extrabold tracking-tight text-oldschool-orange sm:text-[5rem]">
          Tulevat tapahtumat
        </h1>
        <ul className="pt-8 text-white">
          <li> 19.07.2024 - Mikrokosmos</li>
          <li> 03.08.2024 - HYTKY x Entropy @ Kallio Block Party</li>
        </ul>
        <Link href="/">
          <p className="pt-8 text-white">← Takaisin</p>
        </Link>
      </main>
    </>
  );
};

export default EventArchive;