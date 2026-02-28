"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Download, X, Settings2, Clapperboard, Loader2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface VideoEntry {
  file: File;
  previewUrl: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  status: "idle" | "loading-ffmpeg" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const FFMPEG_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

export default function VideoToGifTool() {
  const [entries, setEntries] = useState<VideoEntry[]>([]);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [startSec, setStartSec] = useState(0);
  const [durationSec, setDurationSec] = useState(5);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const getFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpegRef.current && ffmpegLoaded) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
    setFfmpegLoaded(true);
    return ffmpeg;
  }, [ffmpegLoaded]);

  const handleFiles = useCallback((newFiles: File[]) => {
    const videoFiles = newFiles.filter((f) => f.type.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)$/i.test(f.name));
    const newEntries: VideoEntry[] = videoFiles.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: "idle",
      progress: 0,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const convert = useCallback(
    async (index: number) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "loading-ffmpeg", progress: 0, error: undefined } : e))
      );

      try {
        const ffmpeg = await getFFmpeg();

        setEntries((prev) =>
          prev.map((e, i) => (i === index ? { ...e, status: "processing", progress: 5 } : e))
        );

        ffmpeg.on("progress", ({ progress }) => {
          setEntries((prev) =>
            prev.map((e, i) =>
              i === index ? { ...e, progress: Math.min(95, Math.round(progress * 100)) } : e
            )
          );
        });

        const entry = entries[index];
        const ext = entry.file.name.split(".").pop() || "mp4";
        const inputName = `input.${ext}`;

        await ffmpeg.writeFile(inputName, await fetchFile(entry.file));

        const args = ["-ss", String(startSec), "-t", String(durationSec), "-i", inputName,
          "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
          "-loop", "0", "output.gif"];

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile("output.gif");
        const blob = new Blob([data as unknown as BlobPart], { type: "image/gif" });
        const url = URL.createObjectURL(blob);

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile("output.gif");

        setEntries((prev) =>
          prev.map((e, i) =>
            i === index ? { ...e, outputBlob: blob, outputUrl: url, outputSize: blob.size, status: "done", progress: 100 } : e
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed";
        setEntries((prev) =>
          prev.map((e, i) => (i === index ? { ...e, status: "error", progress: 0, error: message } : e))
        );
      }
    },
    [entries, getFFmpeg, fps, width, startSec, durationSec]
  );

  const remove = (index: number) => {
    setEntries((prev) => {
      const e = prev[index];
      if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      if (e.outputUrl) URL.revokeObjectURL(e.outputUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadEntry = (entry: VideoEntry) => {
    if (!entry.outputBlob) return;
    const name = entry.file.name.replace(/\.[^/.]+$/, "");
    downloadBlob(entry.outputBlob, `${name}.gif`);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="w-4 h-4 text-violet-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Conversion Settings</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              FPS: <span className="text-violet-500 font-semibold">{fps}</span>
            </label>
            <input type="range" min={5} max={30} step={1} value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Width: <span className="text-violet-500 font-semibold">{width}px</span>
            </label>
            <input type="range" min={160} max={1280} step={16} value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Start (sec): <span className="text-violet-500 font-semibold">{startSec}s</span>
            </label>
            <input type="range" min={0} max={60} step={0.5} value={startSec}
              onChange={(e) => setStartSec(parseFloat(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Duration: <span className="text-violet-500 font-semibold">{durationSec}s</span>
            </label>
            <input type="range" min={1} max={30} step={0.5} value={durationSec}
              onChange={(e) => setDurationSec(parseFloat(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <DropZone
        onFiles={handleFiles}
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
        multiple={true}
        label="Drop video files here"
      />

      {/* File List */}
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
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <video src={entry.previewUrl} className="w-full h-full object-cover" muted />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(entry.file.size)}
                  {entry.outputSize && (
                    <span className="ml-2 text-violet-500 font-medium">→ {formatFileSize(entry.outputSize)} GIF</span>
                  )}
                </p>

                {(entry.status === "loading-ffmpeg" || entry.status === "processing") && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {entry.status === "loading-ffmpeg" ? "Loading FFmpeg engine…" : "Converting…"}
                    </p>
                    <ProgressBar value={entry.progress} />
                  </div>
                )}

                {entry.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">{entry.error ?? "Conversion failed"}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.status === "idle" && (
                  <Button size="sm" onClick={() => convert(index)} className="bg-violet-500 hover:bg-violet-600 text-white">
                    <Clapperboard className="w-3.5 h-3.5 mr-1" /> Convert
                  </Button>
                )}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download GIF
                  </Button>
                )}
                {(entry.status === "error") && (
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
          <Button
            onClick={() => entries.forEach((e, i) => e.status === "idle" && convert(i))}
            className="bg-violet-500 hover:bg-violet-600 text-white"
          >
            Convert All
          </Button>
        </div>
      )}
    </div>
  );
}
