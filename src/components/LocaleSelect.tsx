"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import Link from "next/link";
import { LanguageIcon } from "@heroicons/react/24/solid";

export const LocaleSelect = ({ style = ""}) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className={"flex flex-row-reverse w-full px-3 pb-3".concat(style.length?` ${style}`:"")}>
      <div className="border-2 border-dotted border-orange-600">
        <div className="flex flex-row gap-2 pr-1 text-white">
          <LanguageIcon className="pl-50 size-6 text-white" />
          <Link href={{ pathname: pathname }} locale="fi">
            <span className={router.locale == "fi" ? "text-gray-700" : ""}>
              Fi
            </span>
          </Link>
          <span>|</span>
          <Link href={{ pathname: pathname }} locale="en">
            <span className={router.locale == "en" ? "text-gray-700" : ""}>
              En
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LocaleSelect;