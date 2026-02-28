"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function DropZone({
  onFiles,
  accept = "*/*",
  multiple = false,
  label = "Drop files here",
  sublabel = "or click to browse",
  className,
  disabled = false,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) onFiles(droppedFiles);
    },
    [onFiles, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);
      if (selectedFiles.length > 0) onFiles(selectedFiles);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none",
        isDragging
          ? "border-sky-400 bg-sky-50 dark:bg-sky-950/30 scale-[1.01]"
          : "border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-800/50 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={isDragging ? "dragging" : "idle"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            isDragging
              ? "bg-sky-100 dark:bg-sky-900/50"
              : "bg-slate-100 dark:bg-gray-700"
          )}
        >
          {isDragging ? (
            <FileUp className="w-7 h-7 text-sky-500" />
          ) : (
            <Upload className="w-7 h-7 text-slate-400 dark:text-gray-400" />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="text-center">
        <p className={cn("font-semibold text-base", isDragging ? "text-sky-600 dark:text-sky-400" : "text-gray-700 dark:text-gray-200")}>
          {isDragging ? "Release to upload" : label}
        </p>
        {!isDragging && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{sublabel}</p>
        )}
      </div>
    </label>
  );
}
