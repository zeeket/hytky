import { type NextPage } from "next";
import Link from "next/link";

const RentalInfo: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-5xl font-extrabold tracking-tight text-oldschool-orange sm:text-[5rem]">
          Vuokraus
        </h1>
        <p className="text-2xl text-white p-4">Tiedustele sähköpostilla.</p>
        <p className="text-2xl text-white p-2">Laitteistoa:</p>
        <ul className="list-disc text-white px-5">
          <li>Iso äänentoisto (4 yläpäätä, 4-10 subwooferia, vahvistimet)</li>
          <li>Pieni äänentoisto (2 aktiiviyläpäätä, 2 aktiivisubwooferia)</li>
          <li>Monitorikaiuttimet (2 pientä aktiiviyläpäätä)</li>
          <li>Technics-levysoittimet, Pioneer DJM-750 DJ-mikseri</li>
          <li>Diskovaloja (LED, PAR)</li>
          <li>Savukone, usvakone ym.</li>
        </ul>
        <Link href="/">
          <p className="pt-8 text-white">← Takaisin</p>
        </Link>
      </main>
    </>
  );
};

export default RentalInfo;