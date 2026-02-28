"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, ChevronUp, ChevronDown, FileDown, Loader2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

type PageSize = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

// Convert any image to JPEG bytes via canvas (pdf-lib only supports JPG & PNG)
async function toJpegBytes(file: File, quality = 0.92): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      // White background for transparent images
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        async (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve(new Uint8Array(await blob.arrayBuffer()));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function toPngBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        async (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve(new Uint8Array(await blob.arrayBuffer()));
        },
        "image/png"
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

const PAGE_SIZES: Record<PageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  fit: [0, 0], // dynamic
};

export default function ImageToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState(20);
  const [converting, setConverting] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const newItems: ImageItem[] = imageFiles.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
  }, []);

  const remove = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setImages((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const convert = async () => {
    if (images.length === 0) return;
    setConverting(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const isPng = item.file.type === "image/png";
        let imgBytes: Uint8Array;
        let pdfImage;

        if (isPng) {
          imgBytes = await toPngBytes(item.file);
          pdfImage = await pdfDoc.embedPng(imgBytes);
        } else {
          imgBytes = await toJpegBytes(item.file);
          pdfImage = await pdfDoc.embedJpg(imgBytes);
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pageW: number, pageH: number;

        if (pageSize === "fit") {
          pageW = imgWidth;
          pageH = imgHeight;
        } else {
          [pageW, pageH] = PAGE_SIZES[pageSize];
          if (orientation === "landscape") [pageW, pageH] = [pageH, pageW];
        }

        const page = pdfDoc.addPage([pageW, pageH]);
        const m = margin;
        const drawW = pageW - m * 2;
        const drawH = pageH - m * 2;
        const scale = Math.min(drawW / imgWidth, drawH / imgHeight);
        const finalW = imgWidth * scale;
        const finalH = imgHeight * scale;
        const x = m + (drawW - finalW) / 2;
        const y = m + (drawH - finalH) / 2;

        page.drawImage(pdfImage, { x, y, width: finalW, height: finalH });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }), "images-to-pdf.pdf");
    } catch (err) {
      console.error(err);
      alert("Conversion failed. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Page Size
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PageSize)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="fit">Fit to Image</option>
          </select>
        </div>

        {pageSize !== "fit" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Orientation
            </label>
            <div className="flex gap-2">
              {(["portrait", "landscape"] as Orientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`flex-1 py-2 text-sm rounded-xl border font-medium transition-colors capitalize ${
                    orientation === o
                      ? "bg-sky-500 border-sky-500 text-white"
                      : "border-slate-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sky-400"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Margin: {margin}px
          </label>
          <input
            type="range"
            min={0}
            max={60}
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>
      </div>

      {/* DropZone */}
      <DropZone
        onFiles={handleFiles}
        accept="image/*"
        multiple
        label="Drop images here"
        sublabel="JPG, PNG, WEBP · Each image becomes one page in the PDF"
      />

      {/* Image list */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {images.length} image{images.length > 1 ? "s" : ""} · {images.length} page{images.length > 1 ? "s" : ""} in PDF
            </p>

            {images.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700"
              >
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-gray-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(item.file.size)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-25 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === images.length - 1}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-25 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Convert button */}
            <div className="pt-2">
              <Button
                onClick={convert}
                disabled={converting}
                icon={converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                className="w-full sm:w-auto justify-center"
              >
                {converting ? "Creating PDF..." : `Convert ${images.length} Image${images.length > 1 ? "s" : ""} to PDF`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
