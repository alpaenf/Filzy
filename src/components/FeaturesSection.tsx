"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Globe, Sparkles, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const featureIcons = [Shield, Zap, Lock, Globe, Sparkles, Package];
const featureColors = [
  { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40" },
  { color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
  { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
];

export default function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-500 mb-3">
            {t.features.sectionLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.features.heading1}{" "}
            <span className="bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
              {t.features.heading2}
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            {t.features.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((feature, index) => {
            const Icon = featureIcons[index];
            const { color, bg } = featureColors[index];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 p-6 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-gray-900/50 transition-shadow duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
