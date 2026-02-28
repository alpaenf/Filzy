"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, QrCode, Settings2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { downloadBlob } from "@/lib/utils";

type ErrorLevel = "L" | "M" | "Q" | "H";
type QrFormat = "png" | "svg";

const SCHEMES = [
  { label: "URL", prefix: "" },
  { label: "Email", prefix: "mailto:" },
  { label: "Phone", prefix: "tel:" },
  { label: "SMS", prefix: "sms:" },
  { label: "WiFi", prefix: "WIFI:T:WPA;S:" },
];

export default function QrGeneratorTool() {
  const [text, setText] = useState("https://filzy.app");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [format, setFormat] = useState<QrFormat>("png");
  const [scheme, setScheme] = useState(0);
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgContent, setSvgContent] = useState("");

  const generate = useCallback(async () => {
    const QRCode = (await import("qrcode")).default;
    const value = SCHEMES[scheme].prefix + text;

    if (format === "png") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, value, {
        width: size,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      });
      setSvgContent("");
    } else {
      const svg = await QRCode.toString(value, {
        type: "svg",
        width: size,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      });
      setSvgContent(svg);
    }
    setGenerated(true);
  }, [text, size, errorLevel, fgColor, bgColor, format, scheme]);

  // Auto-generate when settings change (debounced for text)
  useEffect(() => {
    if (!text.trim()) return;
    const timer = setTimeout(() => generate(), 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, size, errorLevel, fgColor, bgColor, format, scheme]);

  const download = () => {
    if (format === "png") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => blob && downloadBlob(blob, "qrcode.png"), "image/png");
    } else {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      downloadBlob(blob, "qrcode.svg");
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-cyan-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Settings</h2>
        </div>

        {/* Scheme selector */}
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Content type</p>
          <div className="flex flex-wrap gap-2">
            {SCHEMES.map((s, i) => (
              <button key={i} onClick={() => setScheme(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  scheme === i ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-400"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            {SCHEMES[scheme].label} value
          </label>
          {SCHEMES[scheme].prefix && (
            <p className="text-xs text-gray-400 mb-1">Prefix: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{SCHEMES[scheme].prefix}</code></p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), generate())}
            rows={2}
            className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter your URL, text, or data…"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Size: <span className="text-cyan-500">{size}px</span>
            </label>
            <input type="range" min={128} max={600} step={8} value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          {/* Error correction */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Error correction</p>
            <div className="flex gap-1">
              {(["L", "M", "Q", "H"] as ErrorLevel[]).map((lvl) => (
                <button key={lvl} onClick={() => setErrorLevel(lvl)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    errorLevel === lvl ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-200 dark:border-gray-700 text-gray-500 hover:border-cyan-400"
                  }`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          {/* Colors */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Foreground</p>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-gray-700 cursor-pointer bg-transparent" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Background</p>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-gray-700 cursor-pointer bg-transparent" />
          </div>
        </div>

        {/* Format + Generate */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
            {(["png", "svg"] as QrFormat[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                  format === f ? "bg-cyan-500 text-white" : "text-gray-500 dark:text-gray-400"
                }`}>
                {f}
              </button>
            ))}
          </div>
          <Button onClick={generate}>
            <QrCode className="w-3.5 h-3.5 mr-1" /> Generate
          </Button>
        </div>
      </div>

      {/* Preview — canvas always in DOM so ref is stable; hidden via CSS when not needed */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: generated ? 1 : 0, y: generated ? 0 : 10 }}
        className={`bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm flex flex-col items-center gap-5 ${!generated ? "pointer-events-none" : ""}`}
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white self-start">Preview</p>

        {/* Single canvas — always mounted, ref always valid */}
        <canvas
          ref={canvasRef}
          className={`rounded-xl shadow-md max-w-full ${format !== "png" ? "hidden" : ""}`}
        />

        {/* SVG preview */}
        {format === "svg" && svgContent && (
          <div
            className="rounded-xl shadow-md overflow-hidden max-w-full"
            style={{ width: size, maxWidth: "100%" }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        <Button onClick={download} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Download className="w-3.5 h-3.5 mr-1" /> Download {format.toUpperCase()}
        </Button>
      </motion.div>
    </div>
  );
}
