import Link from "next/link";

export default function Footer() {
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
            All processing happens in your browser.{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">Your files never leave your device.</span>
          </p>

          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "GitHub"].map((item) => (
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
            © {new Date().getFullYear()} Filzy. Built for privacy-first file processing.
          </p>
        </div>
      </div>
    </footer>
  );
}
