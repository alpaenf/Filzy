"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Sun, Moon, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = resolvedTheme === "dark";

  const navLinks = [
    { label: t.nav.tools, href: "/#tools" },
    { label: t.nav.features, href: "/#features" },
    { label: t.nav.about, href: "/#about" },
  ];

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
      />

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1"
      >
        <motion.nav
          animate={
            scrolled
              ? { boxShadow: "0 4px 30px rgba(0,0,0,0.08)" }
              : { boxShadow: "0 0px 0px rgba(0,0,0,0)" }
          }
          transition={{ duration: 0.3 }}
          className={cn(
            "max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between rounded-2xl transition-colors duration-300",
            scrolled
              ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-gray-700/70"
              : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-slate-200/50 dark:border-gray-700/40"
          )}
        >
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group relative">
            <motion.span
              className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
              whileHover="hover"
            >
              Fil
              <motion.span
                className="relative inline-block"
                variants={{
                  hover: { color: "#06b6d4" },
                }}
                transition={{ duration: 0.2 }}
              >
                zy
                {/* shimmer sweep */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20 skew-x-[-20deg]"
                  initial={{ x: "-120%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </motion.span>
            </motion.span>
            {/* subtle glow dot */}
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
                onHoverStart={() => setHoveredLink(link.label)}
                onHoverEnd={() => setHoveredLink(null)}
              >
                {/* hover pill bg */}
                {hoveredLink === link.label && (
                  <motion.span
                    layoutId="navPill"
                    className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Link
                  href={link.href}
                  className="relative z-10 block px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors duration-150"
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDark ? "sun" : "moon"}
                    initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 40, scale: 0.6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            )}

            {/* Language toggle — sliding pill */}
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden p-0.5 gap-0.5">
              {(["id", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className="relative z-10 px-2.5 py-1 text-xs font-semibold uppercase transition-colors duration-200"
                  style={{
                    color: locale === lang ? "#fff" : undefined,
                  }}
                >
                  {locale === lang && (
                    <motion.span
                      layoutId="langPill"
                      className="absolute inset-0 rounded-lg bg-cyan-500"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={cn("relative z-10", locale !== lang && "text-gray-500 dark:text-gray-400")}>
                    {lang}
                  </span>
                </button>
              ))}
            </div>

            {/* Get Started CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden sm:block"
            >
              <Link href="/#tools">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white overflow-hidden cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #22d3ee 0%, #0ea5e9 50%, #7c3aed 100%)",
                  }}
                >
                  {/* shimmer overlay */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                    animate={{ x: ["-120%", "220%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                  />
                  <Sparkles className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{t.nav.getStarted}</span>
                </motion.span>
              </Link>
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden rounded-2xl mt-1.5 border border-slate-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.06 + 0.04, duration: 0.25 }}
                  className="mt-2 pt-3 border-t border-slate-100 dark:border-gray-800"
                >
                  <Link
                    href="/#tools"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #22d3ee 0%, #0ea5e9 50%, #7c3aed 100%)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {t.nav.getStarted}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
