import { type NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import HytkyLogo from '../../public/hytkylogo.svg';
import Miukumauku from '../../public/miukumauku2.svg';

import Layout from '~/components/Layout';
import LocaleSelect from '~/components/LocaleSelect';

import fiContent from '~/locales/fi/rental.json';
import enContent from '~/locales/en/rental.json';

interface RentalItem {
  name: string;
  price: string;
  description?: string;
  wrapPrice?: boolean;
}

interface RentalCategory {
  heading: string;
  items: RentalItem[];
}

interface RentalContent {
  title: string;
  titleSuffix: string;
  intro: string;
  contactPre: string;
  contactPost: string;
  logistics: string;
  priceNote: string;
  categories: RentalCategory[];
  cablesNote: string;
  backLink: string;
}

const fiContentTyped = fiContent as RentalContent;
const enContentTyped = enContent as RentalContent;

const RentalInfo: NextPage = () => {
  const { locale } = useRouter();
  const content: RentalContent =
    locale === 'fi' ? fiContentTyped : enContentTyped;
  return (
    <Layout title={content.title}>
      <LocaleSelect />
      <h1 className="text-oldschool-orange flex items-center justify-center gap-3 text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        <HytkyLogo className="h-10 w-auto sm:h-16" alt="HYTKY" />
        {content.titleSuffix}
      </h1>
      <p className="p-4 text-center text-2xl text-white">{content.intro}</p>
      <p className="px-4 text-center text-xl text-white">
        {content.contactPre}{' '}
        <span className="inline-block tracking-tight">
          hytky
          <Miukumauku width={15} height={15} className="inline-block" />
          hytky.org
        </span>
        {content.contactPost}
      </p>
      <p className="w-5/6 max-w-2xl p-4 text-center text-white">
        {content.logistics}
      </p>
      <p className="w-5/6 max-w-2xl p-2 text-center text-white italic">
        {content.priceNote}
      </p>
      <div className="w-5/6 max-w-2xl">
        {content.categories.map((category) => (
          <div key={category.heading} className="pt-6">
            <h2 className="text-oldschool-orange pb-2 text-2xl font-bold">
              {category.heading}
            </h2>
            <ul className="divide-y divide-white/10">
              {category.items.map((item) => (
                <li key={item.name} className="flex flex-col py-2 text-white">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0 break-words">{item.name}</span>
                    <span
                      className={`min-w-0 text-right font-bold ${
                        item.wrapPrice
                          ? 'break-words whitespace-normal sm:whitespace-nowrap'
                          : 'whitespace-nowrap'
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>
                  {item.description && (
                    <span className="text-sm whitespace-pre-line text-white/70">
                      {item.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="w-5/6 max-w-2xl p-4 text-center text-white">
        {content.cablesNote}
      </p>
      <Link
        href="/"
        className="hover:bg-newschool-orange mt-8 mb-12 h-12 w-40 rounded-lg bg-white/10 p-3 text-center text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
      >
        {content.backLink}
      </Link>
    </Layout>
  );
};

export default RentalInfo;
