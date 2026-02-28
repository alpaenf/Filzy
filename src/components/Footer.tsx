"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Fil<span className="text-sky-500">zy</span>
            </span>
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {t.footer.privacy}{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{t.footer.privacyHighlight}</span>
          </p>

          <div className="flex items-center gap-6">
            {t.footer.links.map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Filzy. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
