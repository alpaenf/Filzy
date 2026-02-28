"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Copy, Check, Loader2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import { formatFileSize } from "@/lib/utils";

type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGOS: HashAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

interface FileEntry {
  file: File;
  hashes: Partial<Record<HashAlgo, string>>;
  status: "idle" | "processing" | "done" | "error";
  error?: string;
}

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function FileHashTool() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedAlgos, setSelectedAlgos] = useState<HashAlgo[]>(["SHA-256"]);
  const [copied, setCopied] = useState<string | null>(null);

  const toggleAlgo = (algo: HashAlgo) => {
    setSelectedAlgos((prev) =>
      prev.includes(algo)
        ? prev.length > 1 ? prev.filter((a) => a !== algo) : prev
        : [...prev, algo]
    );
  };

  const handleFiles = useCallback((newFiles: File[]) => {
    setEntries((prev) => [
      ...prev,
      ...newFiles.map((f) => ({ file: f, hashes: {}, status: "idle" as const })),
    ]);
  }, []);

  const hashFile = useCallback(
    async (index: number) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "processing", hashes: {}, error: undefined } : e))
      );

      try {
        const file = entries[index].file;
        const buf = await file.arrayBuffer();
        const hashes: Partial<Record<HashAlgo, string>> = {};

        for (const algo of selectedAlgos) {
          const digest = await crypto.subtle.digest(algo, buf);
          hashes[algo] = bytesToHex(digest);
        }

        setEntries((prev) =>
          prev.map((e, i) => (i === index ? { ...e, hashes, status: "done" } : e))
        );
      } catch (err) {
        setEntries((prev) =>
          prev.map((e, i) =>
            i === index ? { ...e, status: "error", error: err instanceof Error ? err.message : "Failed" } : e
          )
        );
      }
    },
    [entries, selectedAlgos]
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const remove = (index: number) => setEntries((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Algorithm selector */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Hash Algorithms</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALGOS.map((algo) => (
            <button
              key={algo}
              onClick={() => toggleAlgo(algo)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                selectedAlgos.includes(algo)
                  ? "bg-cyan-500 border-cyan-500 text-white"
                  : "border-slate-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-400"
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Uses the browser&apos;s built-in <strong>Web Crypto API</strong> — files never leave your device.
        </p>
      </div>

      <DropZone onFiles={handleFiles} accept="*/*" multiple={true} label="Drop any files here" sublabel="Any file type — hash is computed locally" />

      <AnimatePresence>
        {entries.map((entry, index) => (
          <motion.div
            key={entry.file.name + index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(entry.file.size)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.status === "idle" && (
                  <button
                    onClick={() => hashFile(index)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                  >
                    Calculate
                  </button>
                )}
                {entry.status === "processing" && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" /> Hashing…
                  </span>
                )}
                <button onClick={() => remove(index)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {entry.status === "done" && (
              <div className="space-y-2">
                {(Object.entries(entry.hashes) as [HashAlgo, string][]).map(([algo, hash]) => {
                  const key = `${index}-${algo}`;
                  return (
                    <div key={algo} className="rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3 py-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{algo}</span>
                        <button
                          onClick={() => copyToClipboard(hash, key)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-500 transition-colors"
                        >
                          {copied === key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copied === key ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all leading-relaxed">{hash}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {entry.status === "error" && <p className="text-xs text-red-500">{entry.error}</p>}
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length > 1 && entries.some((e) => e.status === "idle") && (
        <div className="flex justify-center">
          <button
            onClick={() => entries.forEach((e, i) => e.status === "idle" && hashFile(i))}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:opacity-90 transition-opacity"
          >
            Hash All Files
          </button>
        </div>
      )}
    </div>
  );
}
