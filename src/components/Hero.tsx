"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Cpu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const highlightIcons = [Shield, Zap, Cpu];

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 18);
    return () => clearTimeout(timer);
  }, [started, displayed, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-5 ml-0.5 bg-cyan-500 align-middle animate-pulse" />
      )}
    </span>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-sky-100/60 to-transparent dark:from-sky-950/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-violet-100/40 dark:bg-violet-950/20 rounded-full blur-3xl" />
        <div className="absolute top-10 left-1/4 w-48 h-48 bg-sky-100/50 dark:bg-sky-950/20 rounded-full blur-2xl" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-6"
        >
          {t.hero.headline1}{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent animate-gradient-x">
              {t.hero.headline2}
            </span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          <TypingText text={t.hero.sub} delay={0.65} />
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#tools"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow duration-300"
            >
              {t.hero.exploreBtn}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/tools/remove-bg"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {t.hero.aiBtn}
            </Link>
          </motion.div>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {t.hero.highlights.map(({ label, desc }, i) => {
            const Icon = highlightIcons[i];
            return (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          )})}
        </motion.div>
      </div>
    </section>
  );
}
