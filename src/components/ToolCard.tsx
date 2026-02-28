"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

const categoryColors: Record<Tool["category"], string> = {
  image: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
  pdf: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
  file: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  ai: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
  video: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
};

const categoryLabels: Record<Tool["category"], string> = {
  image: "Image",
  pdf: "PDF",
  file: "File",
  ai: "AI",
  video: "Video",
};

export default function ToolCard({ tool, index }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={tool.href} className="group block h-full">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-full bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-gray-900/50 transition-shadow duration-300 flex flex-col gap-4"
        >
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
              `bg-gradient-to-br ${tool.gradient} shadow-md`
            )}
          >
            <tool.icon className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">
                {tool.title}
              </h3>
              {tool.badge && (
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-gray-800">
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", categoryColors[tool.category])}>
              {categoryLabels[tool.category]}
            </span>
            <motion.div
              className="flex items-center gap-1 text-sm font-medium text-sky-500 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={false}
            >
              Open tool
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
