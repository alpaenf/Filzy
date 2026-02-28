"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Layers, Loader2, X, Settings2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface PptxEntry {
  file: File;
  outputBlob?: Blob;
  outputSize?: number;
  slideCount?: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const SLIDE_W = 960;
const SLIDE_H = 540;
const MARGIN = 50;

export default function PptToPdfTool() {
  const [entries, setEntries] = useState<PptxEntry[]>([]);

  const handleFiles = useCallback((newFiles: File[]) => {
    const pptxFiles = newFiles.filter(
      (f) => f.name.toLowerCase().endsWith(".pptx") ||
             f.type.includes("presentationml")
    );
    setEntries((prev) => [
      ...prev,
      ...pptxFiles.map((f) => ({ file: f, status: "idle" as const, progress: 0 })),
    ]);
  }, []);

  const convert = useCallback(async (index: number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "processing", progress: 5, error: undefined } : e))
    );

    try {
      const JSZip = (await import("jszip")).default;
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const file = entries[index].file;
      const arrayBuffer = await file.arrayBuffer();

      const zip = await JSZip.loadAsync(arrayBuffer);

      // Collect slides in order
      const slideKeys = Object.keys(zip.files)
        .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
        .sort((a, b) => {
          const na = parseInt(a.match(/\d+/)![0]);
          const nb = parseInt(b.match(/\d+/)![0]);
          return na - nb;
        });

      if (slideKeys.length === 0) throw new Error("No slides found in this PPTX file.");

      const slideCount = slideKeys.length;
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (let s = 0; s < slideKeys.length; s++) {
        setEntries((prev) =>
          prev.map((e, i) =>
            i === index ? { ...e, progress: Math.round(10 + (s / slideCount) * 82) } : e
          )
        );

        const slideXml = await zip.files[slideKeys[s]].async("string");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXml, "text/xml");

        // Extract text nodes: <a:t> in DrawingML namespace
        const NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
        const textNodes = xmlDoc.getElementsByTagNameNS(NS, "t");
        const texts: string[] = [];
        for (let n = 0; n < textNodes.length; n++) {
          const t = textNodes[n].textContent?.trim();
          if (t) texts.push(t);
        }

        const page = pdfDoc.addPage([SLIDE_W, SLIDE_H]);

        // Light background
        page.drawRectangle({
          x: 0, y: 0, width: SLIDE_W, height: SLIDE_H,
          color: rgb(0.98, 0.98, 0.99),
        });

        // Slide counter badge
        page.drawText(`Slide ${s + 1} / ${slideCount}`, {
          x: SLIDE_W - MARGIN - 60,
          y: MARGIN / 2,
          size: 8,
          font,
          color: rgb(0.65, 0.65, 0.65),
        });

        if (texts.length === 0) {
          page.drawText("[Image / non-text slide]", {
            x: MARGIN, y: SLIDE_H / 2,
            size: 13, font, color: rgb(0.7, 0.7, 0.7),
          });
          continue;
        }

        let y = SLIDE_H - MARGIN;
        let isFirst = true;

        for (const text of texts) {
          if (y < MARGIN + 16) break;
          const fnt = isFirst ? boldFont : font;
          const sz = isFirst ? 20 : 12;
          const maxW = SLIDE_W - MARGIN * 2;

          // Word-wrap
          const words = text.split(" ");
          let line = "";
          const printLines: string[] = [];
          for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            if (fnt.widthOfTextAtSize(test, sz) > maxW && line) {
              printLines.push(line);
              line = w;
            } else {
              line = test;
            }
          }
          if (line) printLines.push(line);

          for (const ln of printLines) {
            if (y < MARGIN + 16) break;
            page.drawText(ln, {
              x: MARGIN, y,
              size: sz, font: fnt,
              color: rgb(0.08, 0.08, 0.1),
              maxWidth: maxW,
            });
            y -= sz * 1.45;
          }

          y -= isFirst ? 12 : 5;
          isFirst = false;
        }
      }

      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, progress: 95 } : e)));

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });

      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, outputBlob: blob, outputSize: blob.size, slideCount, status: "done", progress: 100 }
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

  const remove = (index: number) => setEntries((prev) => prev.filter((_, i) => i !== index));

  const downloadEntry = (entry: PptxEntry) =>
    entry.outputBlob && downloadBlob(entry.outputBlob, entry.file.name.replace(/\.pptx$/i, "") + ".pdf");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">How it works</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Extracts text from each slide in your <strong>.pptx</strong> file and renders them as PDF pages (widescreen 16:9).
          Images and media are substituted with a placeholder — processed entirely in your browser.
        </p>
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
                <Layers className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(entry.file.size)}
                  {entry.slideCount && <span className="ml-2 text-gray-400">· {entry.slideCount} slides</span>}
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
                {entry.status === "idle" && <Button size="sm" onClick={() => convert(index)}>Convert</Button>}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                  </Button>
                )}
                {entry.status === "error" && (
                  <Button size="sm" variant="secondary" onClick={() => convert(index)}>Retry</Button>
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
          <Button onClick={() => entries.forEach((e, i) => e.status === "idle" && convert(i))}>Convert All</Button>
        </div>
      )}
    </div>
  );
}
