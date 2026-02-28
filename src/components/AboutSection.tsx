"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const statValues = ["17+", "100%", "0 KB", "Free"];

export default function AboutSection() {
  const { t } = useLanguage();
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-500 mb-3">
              {t.about.sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t.about.heading1}{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                {t.about.heading2}
              </span>
            </h2>
            <div className="space-y-4 text-gray-500 dark:text-gray-400 leading-relaxed">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>
                {t.about.p3built}{" "}
                <code className="text-sky-500 font-mono text-sm bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5 rounded">
                  browser-image-compression
                </code>
                ,{" "}
                <code className="text-violet-500 font-mono text-sm bg-violet-50 dark:bg-violet-950/30 px-1.5 py-0.5 rounded">
                  pdf-lib
                </code>
                , dan{" "}
                <code className="text-rose-500 font-mono text-sm bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                  @imgly/background-removal
                </code>
                .
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {t.about.stats.map(({ label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-shadow duration-300"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-1">
                  {statValues[i]}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
