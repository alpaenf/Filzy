"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Loader2, X, Settings2, Info } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatFileSize, downloadBlob } from "@/lib/utils";

type CompressionMode = "raster" | "repack";

interface PdfEntry {
  file: File;
  outputBlob?: Blob;
  outputSize?: number;
  savedPercent?: number;
  pageCount?: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const QUALITY_PRESETS = [
  { label: "Low (best compression)", value: 0.4, dpi: 96 },
  { label: "Medium", value: 0.65, dpi: 144 },
  { label: "High", value: 0.82, dpi: 192 },
  { label: "Very High (mild)", value: 0.92, dpi: 220 },
];

export default function PdfCompressTool() {
  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [mode, setMode] = useState<CompressionMode>("raster");
  const [qualityIdx, setQualityIdx] = useState(1);

  const handleFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setEntries((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ file: f, status: "idle" as const, progress: 0 })),
    ]);
  }, []);

  const compress = useCallback(
    async (index: number) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "processing", progress: 5, error: undefined } : e))
      );

      try {
        const file = entries[index].file;
        const arrayBuffer = await file.arrayBuffer();

        if (mode === "repack") {
          // ── Repack mode: strip metadata + use object streams ──
          const { PDFDocument } = await import("pdf-lib");
          setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 30 } : e)));
          const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, pageCount: doc.getPageCount(), progress: 60 } : e)));
          const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });
          const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const savedPercent = Math.round(((file.size - blob.size) / file.size) * 100);
          setEntries((prev) =>
            prev.map((e, i) =>
              i === index ? { ...e, outputBlob: blob, outputSize: blob.size, savedPercent, status: "done", progress: 100 } : e
            )
          );
        } else {
          // ── Raster mode: render each page → JPEG → new PDF ──
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          const { PDFDocument } = await import("pdf-lib");

          const preset = QUALITY_PRESETS[qualityIdx];
          const scale = preset.dpi / 96;

          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const totalPages = pdfDoc.numPages;
          const outDoc = await PDFDocument.create();

          setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, pageCount: totalPages, progress: 10 } : e)));

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          for (let p = 1; p <= totalPages; p++) {
            const page = await pdfDoc.getPage(p);
            const viewport = page.getViewport({ scale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({ canvas, canvasContext: ctx, viewport }).promise;

            const jpegDataUrl = canvas.toDataURL("image/jpeg", preset.value);
            const jpegBase64 = jpegDataUrl.split(",")[1];
            const jpegBytes = Uint8Array.from(atob(jpegBase64), (c) => c.charCodeAt(0));

            const jpegImage = await outDoc.embedJpg(jpegBytes);
            const pdfPage = outDoc.addPage([viewport.width, viewport.height]);
            pdfPage.drawImage(jpegImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });

            setEntries((prev) =>
              prev.map((e, i) =>
                i === index ? { ...e, progress: Math.round(10 + (p / totalPages) * 85) } : e
              )
            );
          }

          const bytes = await outDoc.save({ useObjectStreams: true });
          const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
          const savedPercent = Math.round(((file.size - blob.size) / file.size) * 100);

          setEntries((prev) =>
            prev.map((e, i) =>
              i === index ? { ...e, outputBlob: blob, outputSize: blob.size, savedPercent, status: "done", progress: 100 } : e
            )
          );
        }
      } catch (err) {
        setEntries((prev) =>
          prev.map((e, i) =>
            i === index
              ? { ...e, status: "error", progress: 0, error: err instanceof Error ? err.message : "Compression failed" }
              : e
          )
        );
      }
    },
    [entries, mode, qualityIdx]
  );

  const remove = (index: number) => setEntries((prev) => prev.filter((_, i) => i !== index));

  const downloadEntry = (entry: PdfEntry) =>
    entry.outputBlob && downloadBlob(entry.outputBlob, `compressed_${entry.file.name}`);

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Compression Mode</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["raster", "repack"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${
                mode === m
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
                  : "border-slate-200 dark:border-gray-700 hover:border-cyan-300"
              }`}
            >
              <p className={`text-sm font-semibold ${mode === m ? "text-cyan-600 dark:text-cyan-400" : "text-gray-800 dark:text-gray-200"}`}>
                {m === "raster" ? "🖼 Raster (Max Compression)" : "📦 Repack (Lossless)"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {m === "raster"
                  ? "Re-renders each page as JPEG. Best for scanned PDFs / image-heavy files. Text becomes non-selectable."
                  : "Strips metadata and optimizes object streams. Preserves text & quality. Best for already-digital PDFs."}
              </p>
            </button>
          ))}
        </div>

        {mode === "raster" && (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Image Quality</p>
            <div className="flex flex-wrap gap-2">
              {QUALITY_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setQualityIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    qualityIdx === i
                      ? "bg-cyan-500 border-cyan-500 text-white"
                      : "border-slate-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "raster" && (
          <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Raster mode converts text to images — the resulting PDF won&apos;t have selectable/searchable text.
          </div>
        )}
      </div>

      <DropZone
        onFiles={handleFiles}
        accept="application/pdf,.pdf"
        multiple={true}
        label="Drop PDF files here"
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
                <FileText className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(entry.file.size)}
                  {entry.pageCount && <span className="ml-2 text-gray-400">· {entry.pageCount} pages</span>}
                  {entry.outputSize !== undefined && (
                    <>
                      <span className="ml-2 text-cyan-500 font-medium">→ {formatFileSize(entry.outputSize)}</span>
                      {entry.savedPercent !== undefined && entry.savedPercent > 0 && (
                        <span className="ml-2 text-emerald-500 font-semibold">−{entry.savedPercent}%</span>
                      )}
                      {entry.savedPercent !== undefined && entry.savedPercent <= 0 && (
                        <span className="ml-2 text-amber-500">already optimized</span>
                      )}
                    </>
                  )}
                </p>
                {entry.status === "processing" && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {mode === "raster" ? `Rendering pages… ${entry.progress}%` : "Repacking…"}
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
