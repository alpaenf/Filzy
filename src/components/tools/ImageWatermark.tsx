"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Settings2, Stamp, Loader2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface ImageEntry {
  file: File;
  previewUrl: string;
  outputBlob?: Blob;
  outputUrl?: string;
  status: "idle" | "processing" | "done" | "error";
  error?: string;
}

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITIONS: { label: string; value: Position }[] = [
  { label: "Center", value: "center" },
  { label: "Top Left", value: "top-left" },
  { label: "Top Right", value: "top-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Right", value: "bottom-right" },
];

export default function ImageWatermarkTool() {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [watermarkText, setWatermarkText] = useState("© Filzy");
  const [fontSize, setFontSize] = useState(40);
  const [opacity, setOpacity] = useState(0.5);
  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [rotation, setRotation] = useState(-30);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    const imgs = newFiles.filter((f) => f.type.startsWith("image/") && f.type !== "image/gif");
    setEntries((prev) => [
      ...prev,
      ...imgs.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f), status: "idle" as const })),
    ]);
  }, []);

  const applyWatermark = useCallback(
    async (index: number) => {
      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, status: "processing", error: undefined } : e)));

      try {
        const entry = entries[index];
        const img = new Image();
        img.src = entry.previewUrl;
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const scaledFont = Math.round((img.naturalWidth / 1000) * fontSize);
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = `bold ${scaledFont}px sans-serif`;
        ctx.fillStyle = color;

        const metrics = ctx.measureText(watermarkText);
        const tw = metrics.width;
        const th = scaledFont;
        const pad = scaledFont * 0.6;
        const W = canvas.width;
        const H = canvas.height;

        let cx: number, cy: number;
        if (position === "center") {
          cx = W / 2; cy = H / 2;
        } else if (position === "top-left") {
          cx = pad + tw / 2; cy = pad + th / 2;
        } else if (position === "top-right") {
          cx = W - pad - tw / 2; cy = pad + th / 2;
        } else if (position === "bottom-left") {
          cx = pad + tw / 2; cy = H - pad - th / 2;
        } else {
          cx = W - pad - tw / 2; cy = H - pad - th / 2;
        }

        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Text shadow for readability
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = scaledFont * 0.2;

        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();

        const mimeType = entry.file.type === "image/png" ? "image/png" : "image/jpeg";
        const quality = mimeType === "image/jpeg" ? 0.92 : undefined;

        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mimeType, quality));
        const url = URL.createObjectURL(blob);

        setEntries((prev) =>
          prev.map((e, i) =>
            i === index ? { ...e, outputBlob: blob, outputUrl: url, status: "done" } : e
          )
        );
      } catch (err) {
        setEntries((prev) =>
          prev.map((e, i) =>
            i === index ? { ...e, status: "error", error: err instanceof Error ? err.message : "Failed" } : e
          )
        );
      }
    },
    [entries, watermarkText, fontSize, opacity, color, position, rotation]
  );

  const remove = (index: number) => {
    setEntries((prev) => {
      const e = prev[index];
      if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      if (e.outputUrl) URL.revokeObjectURL(e.outputUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadEntry = (entry: ImageEntry) => {
    if (!entry.outputBlob) return;
    const ext = entry.file.type === "image/png" ? "png" : "jpg";
    downloadBlob(entry.outputBlob, `watermarked_${entry.file.name.replace(/\.[^/.]+$/, "")}.${ext}`);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Watermark Settings</h2>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Watermark text</label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="© Your Name"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Font size: <span className="text-cyan-500">{fontSize}px</span>
            </label>
            <input type="range" min={10} max={120} step={2} value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Opacity: <span className="text-cyan-500">{Math.round(opacity * 100)}%</span>
            </label>
            <input type="range" min={0.05} max={1} step={0.05} value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Rotation: <span className="text-cyan-500">{rotation}°</span>
            </label>
            <input type="range" min={-90} max={90} step={5} value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-gray-700 cursor-pointer bg-transparent" />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Position</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button key={p.value} onClick={() => setPosition(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  position === p.value ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-400"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DropZone onFiles={handleFiles} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple={true} label="Drop images here (JPG, PNG, WEBP)" />

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
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.outputUrl ?? entry.previewUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatFileSize(entry.file.size)}</p>
                {entry.status === "processing" && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Applying watermark…
                  </p>
                )}
                {entry.status === "error" && <p className="text-xs text-red-500 mt-1">{entry.error}</p>}
                {entry.status === "done" && <p className="text-xs text-emerald-500 mt-1">✓ Watermark applied</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.status === "idle" && (
                  <Button size="sm" onClick={() => applyWatermark(index)}>
                    <Stamp className="w-3.5 h-3.5 mr-1" /> Apply
                  </Button>
                )}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                )}
                {entry.status === "error" && <Button size="sm" variant="secondary" onClick={() => applyWatermark(index)}>Retry</Button>}
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
          <Button onClick={() => entries.forEach((e, i) => e.status === "idle" && applyWatermark(i))}>Apply to All</Button>
        </div>
      )}
    </div>
  );
}
