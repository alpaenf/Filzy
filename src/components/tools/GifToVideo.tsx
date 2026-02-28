"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Download, X, Settings2, Repeat2, Loader2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { formatFileSize, downloadBlob } from "@/lib/utils";

interface GifEntry {
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

export default function GifToVideoTool() {
  const [entries, setEntries] = useState<GifEntry[]>([]);
  const [outputFormat, setOutputFormat] = useState<"mp4" | "webm">("mp4");
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
    const gifFiles = newFiles.filter((f) => f.type === "image/gif" || /\.gif$/i.test(f.name));
    const newEntries: GifEntry[] = gifFiles.map((f) => ({
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
        const outExt = outputFormat;
        const mimeType = outExt === "mp4" ? "video/mp4" : "video/webm";

        await ffmpeg.writeFile("input.gif", await fetchFile(entry.file));

        const args =
          outExt === "mp4"
            ? ["-i", "input.gif", "-movflags", "faststart", "-pix_fmt", "yuv420p",
                "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", `output.${outExt}`]
            : ["-i", "input.gif", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", `output.${outExt}`];

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(`output.${outExt}`);
        const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);

        await ffmpeg.deleteFile("input.gif");
        await ffmpeg.deleteFile(`output.${outExt}`);

        setEntries((prev) =>
          prev.map((e, i) =>
            i === index
              ? { ...e, outputBlob: blob, outputUrl: url, outputSize: blob.size, status: "done", progress: 100 }
              : e
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed";
        setEntries((prev) =>
          prev.map((e, i) => (i === index ? { ...e, status: "error", progress: 0, error: message } : e))
        );
      }
    },
    [entries, getFFmpeg, outputFormat]
  );

  const remove = (index: number) => {
    setEntries((prev) => {
      const e = prev[index];
      if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      if (e.outputUrl) URL.revokeObjectURL(e.outputUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const downloadEntry = (entry: GifEntry) => {
    if (!entry.outputBlob) return;
    const name = entry.file.name.replace(/\.[^/.]+$/, "");
    downloadBlob(entry.outputBlob, `${name}.${outputFormat}`);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="w-4 h-4 text-violet-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Output Format</h2>
        </div>
        <div className="flex gap-3">
          {(["mp4", "webm"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setOutputFormat(fmt)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                outputFormat === fmt
                  ? "bg-violet-500 border-violet-500 text-white"
                  : "border-slate-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-400"
              }`}
            >
              .{fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <DropZone
        onFiles={handleFiles}
        accept="image/gif,.gif"
        multiple={true}
        label="Drop GIF files here"
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
              {/* GIF preview */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.previewUrl} alt="GIF preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(entry.file.size)}
                  {entry.outputSize && (
                    <span className="ml-2 text-violet-500 font-medium">
                      → {formatFileSize(entry.outputSize)} {outputFormat.toUpperCase()}
                    </span>
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
                    <Repeat2 className="w-3.5 h-3.5 mr-1" /> Convert
                  </Button>
                )}
                {entry.status === "done" && (
                  <Button size="sm" onClick={() => downloadEntry(entry)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download {outputFormat.toUpperCase()}
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
