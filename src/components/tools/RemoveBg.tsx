"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Sparkles, X, Info } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface BgRemovalItem {
  original: File;
  originalUrl: string;
  resultBlob?: Blob;
  resultUrl?: string;
  status: "idle" | "loading-model" | "processing" | "done" | "error";
  progress: number;
  errorMsg?: string;
}

export default function RemoveBgTool() {
  const [items, setItems] = useState<BgRemovalItem[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelLoadingRef = useRef(false);

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const newItems: BgRemovalItem[] = imageFiles.map((f) => ({
      original: f,
      originalUrl: URL.createObjectURL(f),
      status: "idle",
      progress: 0,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const processItem = useCallback(async (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, status: modelLoaded ? "processing" : "loading-model", progress: 0 } : item
      )
    );

    try {
      // Dynamic import to avoid SSR issues
      const { removeBackground } = await import("@imgly/background-removal");

      if (!modelLoaded && !modelLoadingRef.current) {
        modelLoadingRef.current = true;
      }

      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, status: "processing", progress: 10 } : item))
      );

      const file = items[index].original;

      // Run background removal
      const resultBlob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 90) + 10;
            setItems((prev) =>
              prev.map((item, i) => (i === index ? { ...item, progress: pct } : item))
            );
          }
        },
        output: {
          format: "image/png",
          quality: 1,
        },
      });

      setModelLoaded(true);
      modelLoadingRef.current = false;

      const resultUrl = URL.createObjectURL(resultBlob);
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, resultBlob, resultUrl, status: "done", progress: 100 }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      modelLoadingRef.current = false;
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                status: "error",
                progress: 0,
                errorMsg: "Processing failed. Make sure you're using a modern browser.",
              }
            : item
        )
      );
    }
  }, [items, modelLoaded]);

  const remove = (index: number) => {
    setItems((prev) => {
      const item = prev[index];
      URL.revokeObjectURL(item.originalUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadItem = (item: BgRemovalItem) => {
    if (!item.resultBlob) return;
    downloadBlob(item.resultBlob, `${item.original.name.replace(/\.[^/.]+$/, "")}_no-bg.png`);
  };

  const getStatusLabel = (item: BgRemovalItem) => {
    switch (item.status) {
      case "loading-model":
        return "Loading AI model (first time only)...";
      case "processing":
        return "Removing background...";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800"
      >
        <Sparkles className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-violet-700 dark:text-violet-400 mb-0.5">Runs entirely in your browser</p>
          <p className="text-violet-600/80 dark:text-violet-500">
            The AI model is downloaded once and runs locally. Your images are never sent to any server.
            First use may take 30–60s to load the model.
          </p>
        </div>
      </motion.div>

      {/* Notice about model size */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Info className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-600 dark:text-amber-400">
          The AI model (~50MB) is fetched from CDN on first use. Subsequent uses are instant.
        </p>
      </div>

      {/* DropZone */}
      <DropZone
        onFiles={handleFiles}
        accept="image/*"
        multiple
        label="Drop images here"
        sublabel="JPG, PNG, WEBP · Background will be removed automatically"
      />

      {/* Items */}
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm"
          >
            <div className="flex gap-4">
              {/* Before / After preview */}
              <div className="flex gap-3 shrink-0">
                {/* Original */}
                <div className="relative">
                  <img
                    src={item.originalUrl}
                    alt="original"
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-gray-600"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-slate-700 text-white px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                    BEFORE
                  </span>
                </div>

                {/* Result */}
                {item.resultUrl && (
                  <div className="relative">
                    {/* Checkerboard bg to show transparency */}
                    <div
                      className="w-24 h-24 rounded-xl border-2 border-violet-400 dark:border-violet-500 overflow-hidden"
                      style={{
                        backgroundImage:
                          "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 12px 12px",
                      }}
                    >
                      <img
                        src={item.resultUrl}
                        alt="result"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-violet-500 text-white px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                      AFTER
                    </span>
                  </div>
                )}
              </div>

              {/* Info & actions */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                  {item.original.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {formatFileSize(item.original.size)}{" "}
                  {item.resultBlob && (
                    <span className="text-violet-500 font-medium ml-1">
                      → {formatFileSize(item.resultBlob.size)} PNG
                    </span>
                  )}
                </p>

                {(item.status === "loading-model" || item.status === "processing") && (
                  <div className="space-y-2">
                    <ProgressBar
                      value={item.progress}
                      label={getStatusLabel(item)}
                      variant="ai"
                    />
                  </div>
                )}

                {item.status === "idle" && (
                  <Button
                    size="sm"
                    onClick={() => processItem(index)}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20"
                  >
                    Remove Background
                  </Button>
                )}

                {item.status === "done" && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => downloadItem(item)}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download PNG
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === index ? { ...it, status: "idle", progress: 0, resultBlob: undefined, resultUrl: undefined } : it
                          )
                        );
                      }}
                    >
                      Process Again
                    </Button>
                  </div>
                )}

                {item.status === "error" && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500">{item.errorMsg}</p>
                    <Button size="sm" variant="danger" onClick={() => processItem(index)}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Remove button */}
              {item.status !== "processing" && item.status !== "loading-model" && (
                <button
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 self-start"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
