import type { NextPage } from "next";
import Link from "next/link";

const RentalInfo: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <h1 className="text-5xl font-extrabold text-oldschool-orange pb-2">
          Sähköpostilista
        </h1>
        <h2 className="text-2xl text-white underline p-6">Liittyminen</h2>
        <p className="list-disc text-white pb-1">
            Listalle voi liittyä kuka tahansa lähettämällä viestin</p>
            <p className="text-white font-mono py-2"> 
                  subscribe hytky-lista
              </p>
              
            <p className= "text-white">robotille osoitteeseen <span className="font-mono px-2">majordomo@helsinki.fi</span> </p>
                  <p className="text-white">Viestin otsikolla (subject) ei ole väliä.</p>
              
        <h2 className="text-white text-2xl underline p-6">Poistuminen</h2>
        <p className="list-disc text-white pb-1">Listalta voi poistua lähettämällä viestin</p>
            <p className="text-white font-mono py-2"> unsubscribe hytky-lista </p>
            <p className="text-white">robotille osoitteeseen <span className="font-mono px-2">majordomo@helsinki.fi</span> samasta osoitteesta jolla liityit listalle. </p>
            <p className="text-white">Viestin otsikolla (subject) ei ole väliä.</p>
        <Link href="/">
          <p className="pt-8 text-white">← Takaisin</p>
        </Link>
      </main>
    </>
  );
};

export default RentalInfo;
