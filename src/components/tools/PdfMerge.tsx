"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { Download, X, GripVertical, FileText, CheckCircle2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface PdfItem {
  file: File;
  pageCount?: number;
}

export default function PdfMergeTool() {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const pdfFiles = files.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    const items: PdfItem[] = await Promise.all(
      pdfFiles.map(async (f) => {
        try {
          const buf = await f.arrayBuffer();
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          return { file: f, pageCount: doc.getPageCount() };
        } catch {
          return { file: f };
        }
      })
    );
    setPdfs((prev) => [...prev, ...items]);
    setStatus("idle");
    setResultBlob(null);
  }, []);

  const merge = async () => {
    if (pdfs.length < 2) return;
    setStatus("processing");
    setProgress(10);
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < pdfs.length; i++) {
        const buf = await pdfs[i].file.arrayBuffer();
        setProgress(10 + Math.round((i / pdfs.length) * 70));
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setProgress(90);
      const bytes = await merged.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const remove = (index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index));
    setStatus("idle");
    setResultBlob(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPdfs((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === pdfs.length - 1) return;
    setPdfs((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  return (
    <div className="space-y-6">
      <DropZone onFiles={handleFiles} accept=".pdf,application/pdf" multiple label="Drop PDF files here" sublabel="Multiple files allowed · Will be merged in listed order" />

      <AnimatePresence>
        {pdfs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""} · Drag rows to reorder
            </p>

            {pdfs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col gap-0.5 text-gray-300 dark:text-gray-600">
                  <button onClick={() => moveUp(index)} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xs leading-none">▲</button>
                  <button onClick={() => moveDown(index)} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xs leading-none">▼</button>
                </div>
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(item.file.size)}{item.pageCount ? ` · ${item.pageCount} pages` : ""}
                  </p>
                </div>
                <button onClick={() => remove(index)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            <div className="pt-2">
              {status === "processing" && <ProgressBar value={progress} label="Merging PDFs..." className="mb-4" />}

              {status !== "done" ? (
                <Button
                  onClick={merge}
                  loading={status === "processing"}
                  disabled={pdfs.length < 2}
                  icon={<GripVertical className="w-4 h-4" />}
                >
                  Merge {pdfs.length} PDFs
                </Button>
              ) : (
                <div className="flex gap-3 flex-wrap items-center">
                  <div className="flex-1 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Merged successfully{resultBlob ? ` — ${formatFileSize(resultBlob.size)}` : ""}
                  </div>
                  <Button
                    onClick={() => resultBlob && downloadBlob(resultBlob, "merged.pdf")}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Merged PDF
                  </Button>
                </div>
              )}

              {status === "error" && (
                <p className="text-sm text-red-500 mt-2">Merge failed. Make sure your PDFs are not encrypted.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
