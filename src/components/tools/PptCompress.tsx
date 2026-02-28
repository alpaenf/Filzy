"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Minimize2, Loader2, X, Settings2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface PptxEntry {
  file: File;
  outputBlob?: Blob;
  originalSize: number;
  outputSize?: number;
  savedPercent?: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

export default function PptCompressTool() {
  const [entries, setEntries] = useState<PptxEntry[]>([]);
  const [removeThumbnail, setRemoveThumbnail] = useState(true);
  const [removeUnusedLayouts, setRemoveUnusedLayouts] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    const pptxFiles = newFiles.filter(
      (f) => f.name.toLowerCase().endsWith(".pptx") || f.type.includes("presentationml")
    );
    setEntries((prev) => [
      ...prev,
      ...pptxFiles.map((f) => ({
        file: f,
        originalSize: f.size,
        status: "idle" as const,
        progress: 0,
      })),
    ]);
  }, []);

  const compress = useCallback(
    async (index: number) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "processing", progress: 10, error: undefined } : e))
      );

      try {
        const JSZip = (await import("jszip")).default;

        const file = entries[index].file;
        const arrayBuffer = await file.arrayBuffer();

        setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 25 } : e)));

        const zip = await JSZip.loadAsync(arrayBuffer);

        setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 45 } : e)));

        // Build a new ZIP with max DEFLATE compression
        const newZip = new JSZip();

        const keys = Object.keys(zip.files);
        for (const key of keys) {
          const zipFile = zip.files[key];
          if (zipFile.dir) continue;

          // Optionally remove embedded thumbnail (docProps/thumbnail.*)
          if (removeThumbnail && /^docProps\/thumbnail\./i.test(key)) continue;

          // Optionally remove unused slide layouts (keep only layout1)
          if (removeUnusedLayouts && /^ppt\/slideLayouts\/slideLayout[2-9]\d*\.xml$/i.test(key)) continue;

          const isBinary = /\.(png|jpg|jpeg|gif|wmf|emf|bin|rels)$/i.test(key);
          const content = await zipFile.async(isBinary ? "uint8array" : "string");

          // Use DEFLATE level 9 for text/XML files; store binary as-is (already compressed)
          if (isBinary) {
            newZip.file(key, content, { binary: true, compression: "STORE" });
          } else {
            newZip.file(key, content as string, {
              compression: "DEFLATE",
              compressionOptions: { level: 9 },
            });
          }
        }

        setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 80 } : e)));

        const outArray = await newZip.generateAsync({
          type: "uint8array",
          compression: "DEFLATE",
          compressionOptions: { level: 9 },
        });

        const blob = new Blob([outArray as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        });

        const savedPercent = Math.round(((file.size - blob.size) / file.size) * 100);

        setEntries((prev) =>
          prev.map((e, i) =>
            i === index
              ? { ...e, outputBlob: blob, outputSize: blob.size, savedPercent, status: "done", progress: 100 }
              : e
          )
        );
      } catch (err) {
        setEntries((prev) =>
          prev.map((e, i) =>
            i === index
              ? {
                  ...e,
                  status: "error",
                  progress: 0,
                  error: err instanceof Error ? err.message : "Compression failed",
                }
              : e
          )
        );
      }
    },
    [entries, removeThumbnail, removeUnusedLayouts]
  );

  const remove = (index: number) => setEntries((prev) => prev.filter((_, i) => i !== index));

  const downloadEntry = (entry: PptxEntry) =>
    entry.outputBlob &&
    downloadBlob(entry.outputBlob, entry.file.name.replace(/\.pptx$/i, "") + "_compressed.pptx");

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Compression Options</h2>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={removeThumbnail}
              onChange={(e) => setRemoveThumbnail(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Remove embedded thumbnail
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Deletes the preview image stored in docProps/ (saves 50–200 KB typically)
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={removeUnusedLayouts}
              onChange={(e) => setRemoveUnusedLayouts(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Strip extra slide layouts
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Removes layouts 2+ from the theme (safe only if only layout 1 is used)
              </p>
            </div>
          </label>
        </div>
      </div>

      <DropZone
        onFiles={handleFiles}
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        multiple={true}
        label="Drop PowerPoint (.pptx) files here"
      />

      <AnimatePresence>
        {entries.map((entry, index) => (
          <motion.div
            key={entry.file.name + index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center flex-shrink-0">
                <Minimize2 className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(entry.originalSize)}
                  {entry.outputSize !== undefined && (
                    <>
                      <span className="ml-2 text-cyan-500 font-medium">→ {formatFileSize(entry.outputSize)}</span>
                      {entry.savedPercent !== undefined && entry.savedPercent > 0 && (
                        <span className="ml-2 text-emerald-500 font-semibold">−{entry.savedPercent}%</span>
                      )}
                    </>
                  )}
                </p>
                {entry.status === "processing" && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Compressing…
                    </p>
                    <ProgressBar value={entry.progress} />
                  </div>
                )}
                {entry.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">{entry.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.status === "idle" && <Button size="sm" onClick={() => compress(index)}>Compress</Button>}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                )}
                {entry.status === "error" && (
                  <Button size="sm" variant="secondary" onClick={() => compress(index)}>Retry</Button>
                )}
                <button onClick={() => remove(index)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length > 1 && entries.some((e) => e.status === "idle") && (
        <div className="flex justify-center">
          <Button onClick={() => entries.forEach((e, i) => e.status === "idle" && compress(i))}>Compress All</Button>
        </div>
      )}
    </div>
  );
}
