"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-md shadow-sky-500/20 hover:shadow-sky-500/30 disabled:opacity-60",
  secondary:
    "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700",
  ghost:
    "text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800",
  danger:
    "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-7 py-3 text-base gap-2.5 rounded-2xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  );
}
