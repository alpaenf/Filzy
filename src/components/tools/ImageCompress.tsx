"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import { Download, X, Image, Settings2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface CompressedFile {
  original: File;
  compressed?: Blob;
  originalUrl: string;
  compressedUrl?: string;
  originalSize: number;
  compressedSize?: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
}

export default function ImageCompressTool() {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920);
  const [quality, setQuality] = useState(0.8);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    const entries: CompressedFile[] = imageFiles.map((f) => ({
      original: f,
      originalUrl: URL.createObjectURL(f),
      originalSize: f.size,
      status: "idle",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const compress = useCallback(
    async (index: number) => {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "processing", progress: 0 } : f))
      );

      try {
        const file = files[index].original;
        const options = {
          maxSizeMB,
          maxWidthOrHeight,
          useWebWorker: true,
          initialQuality: quality,
          onProgress: (p: number) => {
            setFiles((prev) =>
              prev.map((f, i) => (i === index ? { ...f, progress: p } : f))
            );
          },
        };
        const compressed = await imageCompression(file, options);
        const url = URL.createObjectURL(compressed);
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, compressed, compressedUrl: url, compressedSize: compressed.size, status: "done", progress: 100 }
              : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status: "error", progress: 0 } : f))
        );
      }
    },
    [files, maxSizeMB, maxWidthOrHeight, quality]
  );

  const compressAll = async () => {
    setIsProcessingAll(true);
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "done") await compress(i);
    }
    setIsProcessingAll(false);
  };

  const remove = (index: number) => {
    setFiles((prev) => {
      const f = prev[index];
      if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadFile = (item: CompressedFile) => {
    if (!item.compressed) return;
    const ext = item.original.name.split(".").pop() || "jpg";
    downloadBlob(item.compressed, `compressed_${item.original.name.replace(/\.[^/.]+$/, "")}.${ext}`);
  };

  const downloadAll = () => {
    files.filter((f) => f.status === "done").forEach(downloadFile);
  };

  return (
    <div className="space-y-6">
      {/* Settings card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="w-4 h-4 text-sky-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Compression Settings</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Max Size (MB): <span className="text-sky-500 font-semibold">{maxSizeMB}</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={maxSizeMB}
              onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Max Resolution: <span className="text-sky-500 font-semibold">{maxWidthOrHeight}px</span>
            </label>
            <input
              type="range"
              min={320}
              max={4096}
              step={64}
              value={maxWidthOrHeight}
              onChange={(e) => setMaxWidthOrHeight(parseInt(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
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
              className="w-full accent-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <DropZone
        onFiles={handleFiles}
        accept="image/*"
        multiple
        label="Drop images here"
        sublabel="Supports JPG, PNG, WEBP · Multiple files allowed"
      />

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Action bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {files.length} file{files.length !== 1 ? "s" : ""} added
              </p>
              <div className="flex gap-2">
                {files.some((f) => f.status === "done") && (
                  <Button variant="secondary" size="sm" onClick={downloadAll} icon={<Download className="w-3.5 h-3.5" />}>
                    Download All
                  </Button>
                )}
                <Button size="sm" onClick={compressAll} loading={isProcessingAll}>
                  Compress All
                </Button>
              </div>
            </div>

            {files.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Previews */}
                  <div className="flex gap-3 shrink-0">
                    <div className="relative">
                      <img
                        src={item.originalUrl}
                        alt="original"
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-gray-600"
                      />
                      <span className="absolute -bottom-1 -left-1 text-[9px] bg-slate-700 text-white px-1.5 py-0.5 rounded-md font-medium">
                        ORIG
                      </span>
                    </div>
                    {item.compressedUrl && (
                      <div className="relative">
                        <img
                          src={item.compressedUrl}
                          alt="compressed"
                          className="w-20 h-20 object-cover rounded-xl border border-sky-300 dark:border-sky-600"
                        />
                        <span className="absolute -bottom-1 -left-1 text-[9px] bg-sky-500 text-white px-1.5 py-0.5 rounded-md font-medium">
                          NEW
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                      {item.original.name}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>Original: {formatFileSize(item.originalSize)}</span>
                      {item.compressedSize && (
                        <>
                          <span>→</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatFileSize(item.compressedSize)}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            -{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%
                          </span>
                        </>
                      )}
                    </div>

                    {item.status === "processing" && (
                      <ProgressBar value={item.progress} label="Compressing..." />
                    )}

                    {item.status === "idle" && (
                      <Button size="sm" onClick={() => compress(index)}>
                        Compress
                      </Button>
                    )}

                    {item.status === "done" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadFile(item)}
                        icon={<Download className="w-3.5 h-3.5" />}
                      >
                        Download
                      </Button>
                    )}

                    {item.status === "error" && (
                      <p className="text-xs text-red-500">Compression failed. Try again.</p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => remove(index)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-400 dark:text-gray-600">
          <Image className="w-5 h-5" />
          <span className="text-sm">No images added yet</span>
        </div>
      )}
    </div>
  );
}
