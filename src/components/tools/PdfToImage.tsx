"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileImage, Loader2, CheckCircle2, Package } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { downloadBlob } from "@/lib/utils";

type OutputFormat = "jpeg" | "png";

interface PageResult {
  pageNum: number;
  dataUrl: string;
  blob?: Blob;
  selected: boolean;
}

export default function PdfToImageTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageResult[]>([]);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.92);
  const [status, setStatus] = useState<"idle" | "rendering" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback((files: File[]) => {
    const pdf = files.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!pdf) return;
    setPdfFile(pdf);
    setPages([]);
    setStatus("idle");
    setProgress(0);
  }, []);

  const renderPdf = async () => {
    if (!pdfFile) return;
    setStatus("rendering");
    setProgress(0);
    setPages([]);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const results: PageResult[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        // White background for JPEG
        if (format === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej()), mimeType, quality)
        );

        results.push({ pageNum: i, dataUrl, blob, selected: true });
        setProgress(Math.round((i / totalPages) * 100));
        setPages([...results]);
      }

      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("Failed to render PDF. Make sure it is a valid PDF file.");
    }
  };

  const toggleSelect = (pageNum: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNum === pageNum ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = () => setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  const selectNone = () => setPages((prev) => prev.map((p) => ({ ...p, selected: false })));

  const downloadOne = (page: PageResult) => {
    if (!page.blob) return;
    const name = `${pdfFile!.name.replace(/\.pdf$/i, "")}_page-${page.pageNum}.${format}`;
    downloadBlob(page.blob, name);
  };

  const downloadAll = async () => {
    const selected = pages.filter((p) => p.selected && p.blob);
    if (selected.length === 0) return;

    if (selected.length === 1) {
      downloadOne(selected[0]);
      return;
    }

    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const baseName = pdfFile!.name.replace(/\.pdf$/i, "");

    for (const p of selected) {
      zip.file(`${baseName}_page-${p.pageNum}.${format}`, p.blob!);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${baseName}_pages.zip`);
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Output Format
          </label>
          <div className="flex gap-2">
            {(["jpeg", "png"] as OutputFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 text-sm rounded-xl border font-medium transition-colors uppercase ${
                  format === f
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "border-slate-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sky-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Scale (Resolution): {scale}×
          </label>
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
          <p className="text-[10px] text-gray-400 mt-1">Higher = larger, sharper image</p>
        </div>

        {format === "jpeg" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              JPEG Quality: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        )}
      </div>

      {/* DropZone */}
      {!pdfFile ? (
        <DropZone
          onFiles={handleFile}
          accept=".pdf,application/pdf"
          multiple={false}
          label="Drop PDF here"
          sublabel="PDF file · Each page will be converted to an image"
        />
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shrink-0">
            <FileImage className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pdfFile.name}</p>
            {status === "done" && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{pages.length} pages rendered</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {status === "idle" && (
              <Button
                size="sm"
                onClick={renderPdf}
                icon={<FileImage className="w-3.5 h-3.5" />}
              >
                Convert
              </Button>
            )}
            <button
              onClick={() => {
                setPdfFile(null);
                setPages([]);
                setStatus("idle");
                setProgress(0);
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {status === "rendering" && (
        <ProgressBar
          value={progress}
          label={`Rendering pages... ${progress}%`}
        />
      )}

      {/* Page grid */}
      <AnimatePresence>
        {pages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-sky-500 hover:text-sky-600 font-medium"
                >
                  Select all
                </button>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
                >
                  Deselect all
                </button>
                <span className="text-xs text-gray-400">({selectedCount} selected)</span>
              </div>

              {status === "done" && (
                <Button
                  size="sm"
                  onClick={downloadAll}
                  disabled={selectedCount === 0}
                  icon={selectedCount > 1 ? <Package className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                >
                  {selectedCount > 1 ? `Download ${selectedCount} as ZIP` : "Download"}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pages.map((page) => (
                <motion.div
                  key={page.pageNum}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    page.selected
                      ? "border-sky-500 shadow-md shadow-sky-500/20"
                      : "border-slate-200 dark:border-gray-700 opacity-60"
                  }`}
                  onClick={() => toggleSelect(page.pageNum)}
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNum}`}
                    className="w-full aspect-[3/4] object-contain bg-white"
                  />
                  {/* Page number badge */}
                  <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                    p.{page.pageNum}
                  </div>
                  {/* Checkmark */}
                  {page.selected && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 bg-white rounded-full" />
                    </div>
                  )}
                  {/* Download single */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadOne(page);
                    }}
                    className="absolute top-1.5 left-1.5 p-1 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                    title="Download this page"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
