"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  className?: string;
  variant?: "default" | "success" | "ai";
}

const variants = {
  default: "from-sky-400 to-blue-500",
  success: "from-emerald-400 to-green-500",
  ai: "from-violet-400 to-purple-600",
};

export default function ProgressBar({ value, label, className, variant = "default" }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", variants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
