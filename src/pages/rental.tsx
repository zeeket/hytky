import { type NextPage } from "next";
import Miukumauku from "../../public/miukumauku2.svg";
import MailIcon from "../../public/mail.svg";
import Link from "next/link";
import { useRouter } from "next/router";

interface RentalContent {
  title: string;
  inquire: string;
  equipmentTitle: string;
  equipment: string[];
  backLink: string;
}

import { LocaleSelect } from "~/components/LocaleSelect";

import fiContent from "~/locales/fi/rental.json";
import enContent from "~/locales/en/rental.json";

const fiContentTyped = fiContent as RentalContent;
const enContentTyped = enContent as RentalContent;

const RentalInfo: NextPage = () => {
  const { locale } = useRouter();
  const content: RentalContent =
    locale === "fi" ? fiContentTyped : enContentTyped;
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <LocaleSelect />
        <h1 className="text-5xl font-extrabold tracking-tight text-oldschool-orange sm:text-[5rem]">
          {content.title}
        </h1>
        <p className="p-4 text-2xl text-white">{content.inquire}</p>
        <span className="inline-block text-white">
          {" "}
          <MailIcon width={20} height={20} className="inline-block" />
          <span className="pl-2 tracking-tight text-white">
            hytky
            <Miukumauku width={15} height={15} className="inline-block" />
            hytky.org
          </span>
        </span>
        <p className="p-2 pt-4 text-2xl text-white">{content.equipmentTitle}</p>
        <ul className="w-5/6 list-inside list-disc px-5 text-center text-white">
          {content.equipment.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <Link href="/">
          <p className="pt-8 text-white" role="button">
            {content.backLink}
          </p>
        </Link>
      </main>
    </>
  );
};

export default RentalInfo;
