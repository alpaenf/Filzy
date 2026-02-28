"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import { formatFileSize, getFileExtension } from "@/lib/utils";

interface FileDetails {
  file: File;
  lastModified: Date;
  extension: string;
  mimeType: string;
  dimensions?: { width: number; height: number };
}

// File size converter
const UNITS = ["B", "KB", "MB", "GB", "TB"];

function sizeInUnit(bytes: number, unit: string): string {
  const unitIndex = UNITS.indexOf(unit);
  if (unitIndex < 0) return "";
  const value = bytes / Math.pow(1024, unitIndex);
  return value >= 1000 ? value.toFixed(0) : value.toPrecision(4);
}

export default function FileInfoTool() {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("MB");
  const [toUnit, setToUnit] = useState("GB");

  const handleFiles = useCallback(async (newFiles: File[]) => {
    const details: FileDetails[] = await Promise.all(
      newFiles.map(async (f) => {
        const detail: FileDetails = {
          file: f,
          lastModified: new Date(f.lastModified),
          extension: getFileExtension(f.name),
          mimeType: f.type || "unknown",
        };
        if (f.type.startsWith("image/")) {
          try {
            const url = URL.createObjectURL(f);
            const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
              const img = new window.Image();
              img.onload = () => { resolve({ width: img.width, height: img.height }); URL.revokeObjectURL(url); };
              img.onerror = reject;
              img.src = url;
            });
            detail.dimensions = dims;
          } catch {}
        }
        return detail;
      })
    );
    setFiles((prev) => [...prev, ...details]);
  }, []);

  const remove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convertedValue = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "—";
    const fromIdx = UNITS.indexOf(fromUnit);
    const toIdx = UNITS.indexOf(toUnit);
    if (fromIdx < 0 || toIdx < 0) return "—";
    const bytes = num * Math.pow(1024, fromIdx);
    const result = bytes / Math.pow(1024, toIdx);
    return result < 0.001 ? result.toExponential(3) : Number(result.toPrecision(6)).toString();
  };

  return (
    <div className="space-y-6">
      {/* Unit converter */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-emerald-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">File Size Unit Converter</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-32 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <span className="text-gray-400 font-medium">=</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 min-w-[80px]">
            {convertedValue()}
          </span>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {/* Reference table */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Quick reference</p>
          <div className="flex flex-wrap gap-2">
            {[["1 KB", 1024], ["1 MB", 1024 * 1024], ["1 GB", 1024 ** 3]].map(([label, bytes]) => (
              <span key={label as string} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                {label as string} = {(bytes as number).toLocaleString()} bytes
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* File Info */}
      <DropZone onFiles={handleFiles} multiple label="Drop files to inspect" sublabel="View detailed metadata for any file type" />

      <AnimatePresence>
        {files.map((detail, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{detail.file.name}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{formatFileSize(detail.file.size)}</p>
              </div>
              <button onClick={() => remove(index)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Extension", value: detail.extension.toUpperCase() || "—" },
                { label: "MIME Type", value: detail.mimeType || "unknown" },
                { label: "Size (bytes)", value: detail.file.size.toLocaleString() },
                { label: "Size (KB)", value: sizeInUnit(detail.file.size, "KB") + " KB" },
                { label: "Size (MB)", value: sizeInUnit(detail.file.size, "MB") + " MB" },
                { label: "Last Modified", value: detail.lastModified.toLocaleDateString() },
                ...(detail.dimensions ? [
                  { label: "Width", value: `${detail.dimensions.width}px` },
                  { label: "Height", value: `${detail.dimensions.height}px` },
                  { label: "Megapixels", value: `${((detail.dimensions.width * detail.dimensions.height) / 1_000_000).toFixed(1)} MP` },
                ] : []),
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
