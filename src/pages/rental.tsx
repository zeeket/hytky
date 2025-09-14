import { type NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Miukumauku from '../../public/miukumauku2.svg';

import Layout from '~/components/Layout';
import LocaleSelect from '~/components/LocaleSelect';

import fiContent from '~/locales/fi/rental.json';
import enContent from '~/locales/en/rental.json';

interface RentalContent {
  title: string;
  inquire: string;
  equipmentTitle: string;
  equipment: string[];
  backLink: string;
}

const fiContentTyped = fiContent as RentalContent;
const enContentTyped = enContent as RentalContent;

const RentalInfo: NextPage = () => {
  const { locale } = useRouter();
  const content: RentalContent =
    locale === 'fi' ? fiContentTyped : enContentTyped;
  return (
    <Layout title={'HYTKY '.concat(content.title)}>
      <LocaleSelect />
      <h1 className="text-oldschool-orange text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        {content.title}
      </h1>
      <p className="p-4 text-2xl text-white">{content.inquire}</p>
      <span className="inline-block text-white">
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
      <Link
        href="/"
        className="hover:bg-newschool-orange mt-8 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
      >
        {content.backLink}
      </Link>
    </Layout>
  );
};

export default RentalInfo;
