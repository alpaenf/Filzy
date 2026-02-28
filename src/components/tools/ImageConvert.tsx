"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, RefreshCw } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadDataUrl } from "@/lib/utils";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface ConvertItem {
  original: File;
  previewUrl: string;
  convertedUrl?: string;
  convertedSize?: number;
  status: "idle" | "processing" | "done" | "error";
}

const FORMAT_OPTIONS: { label: string; value: OutputFormat; ext: string }[] = [
  { label: "JPEG", value: "image/jpeg", ext: "jpg" },
  { label: "PNG", value: "image/png", ext: "png" },
  { label: "WEBP", value: "image/webp", ext: "webp" },
];

export default function ImageConvertTool() {
  const [files, setFiles] = useState<ConvertItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.92);

  const handleFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    const items: ConvertItem[] = imageFiles.map((f) => ({
      original: f,
      previewUrl: URL.createObjectURL(f),
      status: "idle",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const convert = useCallback(
    (index: number) => {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "processing" } : f))
      );

      const item = files[index];
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        if (outputFormat === "image/png") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        // Estimate size from base64
        const base64 = dataUrl.split(",")[1];
        const size = Math.round(base64.length * 0.75);
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, convertedUrl: dataUrl, convertedSize: size, status: "done" }
              : f
          )
        );
      };
      img.onerror = () => {
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
        );
      };
      img.src = item.previewUrl;
    },
    [files, outputFormat, quality]
  );

  const convertAll = () => {
    files.forEach((_, i) => convert(i));
  };

  const remove = (index: number) => {
    setFiles((prev) => {
      const f = prev[index];
      URL.revokeObjectURL(f.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadItem = (item: ConvertItem) => {
    if (!item.convertedUrl) return;
    const fmt = FORMAT_OPTIONS.find((f) => f.value === outputFormat)!;
    downloadDataUrl(item.convertedUrl, `${item.original.name.replace(/\.[^/.]+$/, "")}.${fmt.ext}`);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">Convert Settings</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Output Format
            </label>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setOutputFormat(f.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    outputFormat === f.value
                      ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {outputFormat !== "image/png" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Quality: <span className="text-sky-500 font-semibold">{Math.round(quality * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-48 accent-sky-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Dropzone */}
      <DropZone onFiles={handleFiles} accept="image/*" multiple label="Drop images to convert" sublabel="Supports JPG, PNG, WEBP" />

      {/* Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{files.length} image{files.length !== 1 ? "s" : ""}</p>
              <Button size="sm" onClick={convertAll} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                Convert All
              </Button>
            </div>

            {files.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm flex gap-4"
              >
                <div className="relative shrink-0">
                  <img
                    src={item.convertedUrl || item.previewUrl}
                    alt="preview"
                    className={`w-20 h-20 object-cover rounded-xl border ${item.convertedUrl ? "border-sky-300 dark:border-sky-600" : "border-slate-200 dark:border-gray-600"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">{item.original.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>Original: {formatFileSize(item.original.size)}</span>
                    {item.convertedSize && (
                      <>
                        <span>→</span>
                        <span className="text-sky-600 dark:text-sky-400 font-medium">
                          {FORMAT_OPTIONS.find((f) => f.value === outputFormat)?.label} ~{formatFileSize(item.convertedSize)}
                        </span>
                      </>
                    )}
                  </div>
                  {item.status === "processing" && (
                    <div className="flex items-center gap-2 text-xs text-sky-500">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Converting...
                    </div>
                  )}
                  {item.status === "idle" && (
                    <Button size="sm" onClick={() => convert(index)}>Convert</Button>
                  )}
                  {item.status === "done" && (
                    <Button size="sm" variant="secondary" onClick={() => downloadItem(item)} icon={<Download className="w-3.5 h-3.5" />}>
                      Download
                    </Button>
                  )}
                  {item.status === "error" && <p className="text-xs text-red-500">Conversion failed.</p>}
                </div>
                <button onClick={() => remove(index)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
