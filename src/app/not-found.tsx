"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100 dark:from-sky-900/40 dark:to-violet-900/40 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-sky-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
