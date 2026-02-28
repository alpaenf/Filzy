"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Download, X, Settings2, Music, Loader2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface VideoEntry {
  file: File;
  previewUrl: string;
  outputBlob?: Blob;
  outputSize?: number;
  status: "idle" | "loading-ffmpeg" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const FFMPEG_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

const BITRATE_OPTIONS = [
  { label: "128 kbps", value: "128k" },
  { label: "192 kbps (recommended)", value: "192k" },
  { label: "256 kbps", value: "256k" },
  { label: "320 kbps (best)", value: "320k" },
];

export default function VideoToMp3Tool() {
  const [entries, setEntries] = useState<VideoEntry[]>([]);
  const [bitrate, setBitrate] = useState("192k");
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
    const videoFiles = newFiles.filter(
      (f) => f.type.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(f.name)
    );
    const newEntries: VideoEntry[] = videoFiles.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: "idle",
      progress: 0,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const extract = useCallback(
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

        await ffmpeg.exec([
          "-i", inputName,
          "-vn",
          "-acodec", "libmp3lame",
          "-b:a", bitrate,
          "output.mp3",
        ]);

        const data = await ffmpeg.readFile("output.mp3");
        const blob = new Blob([data as unknown as BlobPart], { type: "audio/mpeg" });

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile("output.mp3");

        setEntries((prev) =>
          prev.map((e, i) =>
            i === index
              ? { ...e, outputBlob: blob, outputSize: blob.size, status: "done", progress: 100 }
              : e
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Extraction failed";
        setEntries((prev) =>
          prev.map((e, i) => (i === index ? { ...e, status: "error", progress: 0, error: message } : e))
        );
      }
    },
    [entries, getFFmpeg, bitrate]
  );

  const remove = (index: number) => {
    setEntries((prev) => {
      const e = prev[index];
      if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadEntry = (entry: VideoEntry) => {
    if (!entry.outputBlob) return;
    const name = entry.file.name.replace(/\.[^/.]+$/, "");
    downloadBlob(entry.outputBlob, `${name}.mp3`);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="w-4 h-4 text-violet-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Audio Quality</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {BITRATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBitrate(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                bitrate === opt.value
                  ? "bg-violet-500 border-violet-500 text-white"
                  : "border-slate-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <DropZone
        onFiles={handleFiles}
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv,.m4v"
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
              {/* Video thumbnail */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                <video src={entry.previewUrl} className="w-full h-full object-cover" muted />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(entry.file.size)}
                  {entry.outputSize && (
                    <span className="ml-2 text-violet-500 font-medium">→ {formatFileSize(entry.outputSize)} MP3</span>
                  )}
                </p>

                {(entry.status === "loading-ffmpeg" || entry.status === "processing") && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {entry.status === "loading-ffmpeg" ? "Loading FFmpeg engine…" : "Extracting audio…"}
                    </p>
                    <ProgressBar value={entry.progress} />
                  </div>
                )}

                {entry.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">{entry.error ?? "Extraction failed"}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.status === "idle" && (
                  <Button size="sm" onClick={() => extract(index)} className="bg-violet-500 hover:bg-violet-600 text-white">
                    <Music className="w-3.5 h-3.5 mr-1" /> Extract
                  </Button>
                )}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download MP3
                  </Button>
                )}
                {entry.status === "error" && (
                  <Button size="sm" variant="secondary" onClick={() => extract(index)}>Retry</Button>
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
            onClick={() => entries.forEach((e, i) => e.status === "idle" && extract(i))}
            className="bg-violet-500 hover:bg-violet-600 text-white"
          >
            Extract All
          </Button>
        </div>
      )}
    </div>
  );
}
