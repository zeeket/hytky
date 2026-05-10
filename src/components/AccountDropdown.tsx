import {
  UserCircleIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export const AccountDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: session } = useSession();
  return (
    <div className="relative inline-block text-left">
      <UserCircleIcon
        className="text-oldschool-orange h-16 w-16"
        onClick={(e) => {
          e.preventDefault();
          setShowDropdown(!showDropdown);
        }}
      />
      {showDropdown && (
        <div className="ring-opacity-5 absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black">
          <div className="flex flex-col">
            <p className="px-4 py-3 text-center text-gray-400">
              Kirjautunut {session?.user.name} ({session?.user.role})
            </p>
            <hr className="h-px border-0 bg-gray-200 dark:bg-gray-700" />
            <a
              href="https://hytky.org"
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <HomeIcon className="h-5 w-5 shrink-0" />
              hytky.org
            </a>
            <hr className="h-px border-0 bg-gray-200 dark:bg-gray-700" />
            <button
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                signOut().catch((err) => console.log(err));
              }}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
              Kirjaudu ulos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
