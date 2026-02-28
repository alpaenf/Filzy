"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Loader2, X, Settings2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface PdfEntry {
  file: File;
  outputBlob?: Blob;
  outputSize?: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

export default function PdfToWordTool() {
  const [entries, setEntries] = useState<PdfEntry[]>([]);

  const handleFiles = useCallback((newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setEntries((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ file: f, status: "idle" as const, progress: 0 })),
    ]);
  }, []);

  const convert = useCallback(async (index: number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "processing", progress: 5, error: undefined } : e))
    );

    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = await import("docx");

      const file = entries[index].file;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const allParagraphs: InstanceType<typeof Paragraph>[] = [
        new Paragraph({
          text: file.name.replace(/\.pdf$/i, ""),
          heading: HeadingLevel.HEADING_1,
        }),
      ];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setEntries((prev) =>
          prev.map((e, i) =>
            i === index
              ? { ...e, progress: Math.round(5 + (pageNum / totalPages) * 80) }
              : e
          )
        );

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group items by approximate line (same Y coordinate within 2px)
        const lines: Map<number, string[]> = new Map();
        for (const item of textContent.items) {
          if ("str" in item && item.str.trim()) {
            const y = Math.round((item as { transform: number[] }).transform[5]);
            if (!lines.has(y)) lines.set(y, []);
            lines.get(y)!.push(item.str);
          }
        }

        // Sort lines top-to-bottom (higher Y = higher on page)
        const sortedYs = [...lines.keys()].sort((a, b) => b - a);

        if (totalPages > 1) {
          allParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `— Page ${pageNum} —`,
                  bold: true,
                  color: "888888",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 240, after: 120 },
            })
          );
        }

        for (const y of sortedYs) {
          const lineText = lines.get(y)!.join(" ").trim();
          if (lineText) {
            allParagraphs.push(
              new Paragraph({
                children: [new TextRun({ text: lineText, size: 24 })],
                spacing: { after: 80 },
              })
            );
          }
        }
      }

      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, progress: 90 } : e))
      );

      const doc = new Document({
        sections: [{ properties: {}, children: allParagraphs }],
      });

      const blob = await Packer.toBlob(doc);

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

  const downloadEntry = (entry: PdfEntry) => {
    if (!entry.outputBlob) return;
    downloadBlob(entry.outputBlob, entry.file.name.replace(/\.pdf$/i, "") + ".docx");
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
          Extracts all text content from your PDF page by page and builds a structured <strong>.docx</strong> file.
          Complex layouts (tables, images, columns) will be linearised as plain paragraphs — processed entirely in your browser.
        </p>
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
                  {entry.outputSize && (
                    <span className="ml-2 text-cyan-500 font-medium">→ {formatFileSize(entry.outputSize)} DOCX</span>
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
                    <Download className="w-3.5 h-3.5 mr-1" /> Download DOCX
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
