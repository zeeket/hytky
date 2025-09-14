'use client';

import { useRouter } from 'next/router';
import Link from 'next/link';
import { LanguageIcon } from '@heroicons/react/24/solid';

export const LocaleSelect = ({ style = '' }) => {
  const router = useRouter();
  return (
    <div
      className={'flex w-full flex-row-reverse px-3 pb-3'.concat(
        style.length ? ` ${style}` : ''
      )}
    >
      <div className="border-2 border-dotted border-orange-600">
        <div className="flex flex-row items-center gap-2 pr-1 text-white">
          <LanguageIcon className="ml-1 h-6 w-6 text-white" />
          <Link href={{ pathname: router.pathname }} locale="fi">
            <span className={router.locale == 'fi' ? 'text-gray-700' : ''}>
              Fi
            </span>
          </Link>
          <span>|</span>
          <Link href={{ pathname: router.pathname }} locale="en">
            <span className={router.locale == 'en' ? 'text-gray-700' : ''}>
              En
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LocaleSelect;
