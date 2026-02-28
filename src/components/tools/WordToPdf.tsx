"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Loader2, X, Settings2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface DocxEntry {
  file: File;
  outputBlob?: Blob;
  outputSize?: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const PAGE_W = 595;       // A4 width  in pt
const PAGE_H = 842;       // A4 height in pt
const MARGIN = 60;        // pt
const LINE_H = 18;        // pt per line
const FONT_SIZE = 11;
const MAX_CHARS_PER_LINE = 90;

function wrapLines(text: string): string[] {
  const result: string[] = [];
  for (const raw of text.split("\n")) {
    const trimmed = raw.trimEnd();
    if (trimmed.length === 0) { result.push(""); continue; }
    let remaining = trimmed;
    while (remaining.length > MAX_CHARS_PER_LINE) {
      let cutAt = remaining.lastIndexOf(" ", MAX_CHARS_PER_LINE);
      if (cutAt <= 0) cutAt = MAX_CHARS_PER_LINE;
      result.push(remaining.slice(0, cutAt));
      remaining = remaining.slice(cutAt + 1);
    }
    result.push(remaining);
  }
  return result;
}

export default function WordToPdfTool() {
  const [entries, setEntries] = useState<DocxEntry[]>([]);

  const handleFiles = useCallback((newFiles: File[]) => {
    const docs = newFiles.filter(
      (f) =>
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.name.endsWith(".docx")
    );
    setEntries((prev) => [
      ...prev,
      ...docs.map((f) => ({ file: f, status: "idle" as const, progress: 0 })),
    ]);
  }, []);

  const convert = useCallback(async (index: number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "processing", progress: 10, error: undefined } : e))
    );

    try {
      const mammoth = (await import("mammoth")).default;
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const file = entries[index].file;
      const arrayBuffer = await file.arrayBuffer();

      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 30 } : e)));

      // Extract raw text via mammoth
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value;

      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 55 } : e)));

      // Build PDF with pdf-lib
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const lines = wrapLines(rawText);
      const usableH = PAGE_H - MARGIN * 2;
      const linesPerPage = Math.floor(usableH / LINE_H);

      // Split into pages
      let lineIndex = 0;
      while (lineIndex < lines.length) {
        const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        let y = PAGE_H - MARGIN;

        // Header: filename on first page
        if (pdfDoc.getPageCount() === 1) {
          const title = file.name.replace(/\.docx$/i, "");
          page.drawText(title, {
            x: MARGIN,
            y,
            size: 14,
            font: boldFont,
            color: rgb(0.1, 0.1, 0.1),
            maxWidth: PAGE_W - MARGIN * 2,
          });
          y -= LINE_H * 2;
        }

        for (let l = 0; l < linesPerPage && lineIndex < lines.length; l++, lineIndex++) {
          const line = lines[lineIndex];
          if (line.trim()) {
            page.drawText(line, {
              x: MARGIN,
              y,
              size: FONT_SIZE,
              font,
              color: rgb(0.1, 0.1, 0.1),
              maxWidth: PAGE_W - MARGIN * 2,
            });
          }
          y -= LINE_H;
        }
      }

      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 88 } : e)));

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });

      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, outputBlob: blob, outputSize: blob.size, status: "done", progress: 100 }
            : e
        )
      );
    } catch (err) {
      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, status: "error", progress: 0, error: err instanceof Error ? err.message : "Conversion failed" }
            : e
        )
      );
    }
  }, [entries]);

  const remove = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadEntry = (entry: DocxEntry) => {
    if (!entry.outputBlob) return;
    downloadBlob(entry.outputBlob, entry.file.name.replace(/\.docx$/i, "") + ".pdf");
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">How it works</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Extracts all text from your <strong>.docx</strong> file and lays it out on A4 PDF pages.
          Images, tables, and complex formatting are simplified to plain text — processed entirely in your browser.
        </p>
      </div>

      <DropZone
        onFiles={handleFiles}
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple={true}
        label="Drop Word (.docx) files here"
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
                  {entry.outputSize && (
                    <span className="ml-2 text-cyan-500 font-medium">→ {formatFileSize(entry.outputSize)} PDF</span>
                  )}
                </p>
                {entry.status === "processing" && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Converting…
                    </p>
                    <ProgressBar value={entry.progress} />
                  </div>
                )}
                {entry.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">{entry.error}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.status === "idle" && (
                  <Button size="sm" onClick={() => convert(index)}>
                    Convert
                  </Button>
                )}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                  </Button>
                )}
                {entry.status === "error" && (
                  <Button size="sm" variant="secondary" onClick={() => convert(index)}>Retry</Button>
                )}
                <button
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length > 1 && entries.some((e) => e.status === "idle") && (
        <div className="flex justify-center">
          <Button onClick={() => entries.forEach((e, i) => e.status === "idle" && convert(i))}>
            Convert All
          </Button>
        </div>
      )}
    </div>
  );
}
