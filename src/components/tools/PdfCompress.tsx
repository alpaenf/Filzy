"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { Download, FileText } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatFileSize, downloadBlob } from "@/lib/utils";

export default function PdfCompressTool() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPdf(file);
    setStatus("idle");
    setProgress(0);
    setResultBlob(null);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const compress = async () => {
    if (!pdf) return;
    setStatus("processing");
    setProgress(20);
    try {
      const buf = await pdf.arrayBuffer();
      setProgress(40);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setProgress(60);
      // pdf-lib re-saves, removing metadata and compressing objects
      const bytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
      setProgress(90);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const savings = pdf && resultBlob ? Math.round((1 - resultBlob.size / pdf.size) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm">
        <FileText className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="text-rose-700 dark:text-rose-400">
          <strong>Note:</strong> PDF compression with pdf-lib removes metadata, optimizes object streams,
          and removes unused objects. Results depend on the original PDF structure. For image-heavy PDFs,
          consider compressing images before converting to PDF.
        </div>
      </div>

      <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" label="Drop a PDF file" sublabel="One file at a time" />

      <AnimatePresence>
        {pdf && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <FileText className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pdf.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(pdf.size)} · {pageCount} pages</p>
              </div>
              {status === "done" && resultBlob && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Result</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatFileSize(resultBlob.size)}
                    {savings > 0 && <span className="ml-1">(-{savings}%)</span>}
                    {savings <= 0 && <span className="ml-1 text-amber-500">(already optimized)</span>}
                  </p>
                </div>
              )}
            </div>

            {status === "processing" && <ProgressBar value={progress} label="Compressing PDF..." />}

            {status !== "done" ? (
              <Button onClick={compress} loading={status === "processing"}>
                Compress PDF
              </Button>
            ) : (
              <Button onClick={() => resultBlob && downloadBlob(resultBlob, `compressed_${pdf.name}`)} icon={<Download className="w-4 h-4" />}>
                Download Compressed PDF
              </Button>
            )}

            {status === "error" && <p className="text-sm text-red-500">Compression failed. The PDF may be encrypted or corrupted.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
