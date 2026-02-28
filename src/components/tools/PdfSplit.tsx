"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Download, FileText, Scissors, CheckCircle2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatFileSize, downloadBlob } from "@/lib/utils";

type SplitMode = "all" | "range";

export default function PdfSplitTool() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>("all");
  const [rangeInput, setRangeInput] = useState("1-3,5,7-9");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPdf(file);
    setStatus("idle");
    setProgress(0);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(0);
    }
  }, []);

  const parseRanges = (input: string, max: number): number[][] => {
    const pages: number[][] = [];
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b) && a >= 1 && b <= max && a <= b) {
          pages.push([a, b]);
        }
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) {
          pages.push([n, n]);
        }
      }
    }
    return pages;
  };

  const split = async () => {
    if (!pdf) return;
    setStatus("processing");
    setProgress(5);

    try {
      const buf = await pdf.arrayBuffer();
      const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = srcDoc.getPageCount();

      let ranges: number[][];
      if (mode === "all") {
        ranges = Array.from({ length: total }, (_, i) => [i + 1, i + 1]);
      } else {
        ranges = parseRanges(rangeInput, total);
      }

      if (ranges.length === 0) {
        setStatus("error");
        return;
      }

      const zip = new JSZip();
      for (let i = 0; i < ranges.length; i++) {
        const [start, end] = ranges[i];
        const newDoc = await PDFDocument.create();
        const indices = Array.from({ length: end - start + 1 }, (_, k) => start - 1 + k);
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const name = ranges.length === 1 ? `split_pages_${start}-${end}.pdf` : `page_${start}${start !== end ? `-${end}` : ""}.pdf`;
        zip.file(name, bytes);
        setProgress(5 + Math.round(((i + 1) / ranges.length) * 90));
      }

      setProgress(98);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${pdf.name.replace(".pdf", "")}_split.zip`);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" label="Drop a PDF file" sublabel="One file at a time" />

      <AnimatePresence>
        {pdf && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{pdf.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(pdf.size)} · {pageCount} pages</p>
              </div>
            </div>

            {/* Mode selection */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Split Mode</p>
              <div className="flex gap-3 mb-4">
                {(["all", "range"] as SplitMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      mode === m
                        ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md"
                        : "bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {m === "all" ? "Split All Pages" : "Custom Range"}
                  </button>
                ))}
              </div>

              {mode === "range" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Page ranges (e.g. <code className="text-orange-500">1-3,5,7-9</code>)
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="1-3, 5, 7-9"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Separate ranges with commas. Each range becomes a separate PDF in a ZIP archive.</p>
                </div>
              )}
            </div>

            {status === "processing" && <ProgressBar value={progress} label="Splitting PDF..." />}

            {status === "done" ? (
              <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Split complete — ZIP file downloaded!
              </p>
            ) : (
              <Button onClick={split} loading={status === "processing"} icon={<Scissors className="w-4 h-4" />}>
                Split PDF
              </Button>
            )}
            {status === "error" && <p className="text-sm text-red-500">Split failed. Make sure the PDF is not encrypted and page ranges are valid.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
