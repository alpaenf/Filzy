"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { Download, X, FileText, Settings2 } from "lucide-react";
import DropZone from "@/components/ui/DropZone";
import Button from "@/components/ui/Button";
import { formatFileSize, getFileExtension, downloadBlob } from "@/lib/utils";

interface RenameItem {
  original: File;
  newName: string;
}

type CaseMode = "none" | "lower" | "upper" | "title";

export default function BulkRenameTool() {
  const [files, setFiles] = useState<RenameItem[]>([]);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [addNumber, setAddNumber] = useState(false);
  const [startNum, setStartNum] = useState(1);
  const [caseMode, setCaseMode] = useState<CaseMode>("none");

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      const items: RenameItem[] = newFiles.map((f) => ({
        original: f,
        newName: f.name,
      }));
      setFiles((prev) => [...prev, ...items]);
    },
    []
  );

  const applyTransform = useCallback(
    (name: string, index: number): string => {
      const ext = "." + getFileExtension(name);
      let base = name.replace(/\.[^/.]+$/, "");

      if (findText) base = base.replaceAll(findText, replaceText);

      switch (caseMode) {
        case "lower":
          base = base.toLowerCase();
          break;
        case "upper":
          base = base.toUpperCase();
          break;
        case "title":
          base = base.replace(/\b\w/g, (c) => c.toUpperCase());
          break;
      }

      if (addNumber) base = `${base}_${String(startNum + index).padStart(3, "0")}`;

      return `${prefix}${base}${suffix}${ext}`;
    },
    [prefix, suffix, findText, replaceText, addNumber, startNum, caseMode]
  );

  const preview = files.map((f, i) => ({
    ...f,
    newName: applyTransform(f.original.name, i),
  }));

  const remove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    preview.forEach(({ original, newName }) => zip.file(newName, original));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "renamed_files.zip");
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Rename Rules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Prefix</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. project_"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Suffix (before extension)</label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. _final"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Find text</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="text to find"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Replace with</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="replacement text"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Case mode */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Case</label>
            <div className="flex gap-2 flex-wrap">
              {(["none", "lower", "upper", "title"] as CaseMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setCaseMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    caseMode === m
                      ? "bg-amber-400 text-white"
                      : "bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {m === "none" ? "Default" : m === "lower" ? "lowercase" : m === "upper" ? "UPPERCASE" : "Title Case"}
                </button>
              ))}
            </div>
          </div>

          {/* Numbering */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addNumber}
                onChange={(e) => setAddNumber(e.target.checked)}
                className="accent-amber-500"
              />
              Add sequential number
            </label>
            {addNumber && (
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                min={0}
                className="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            )}
          </div>
        </div>
      </div>

      <DropZone onFiles={handleFiles} multiple label="Drop files to rename" sublabel="Any file type · Rules applied in real time" />

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{files.length} file{files.length !== 1 ? "s" : ""}</p>
              <Button size="sm" onClick={downloadAll} icon={<Download className="w-3.5 h-3.5" />}>
                Download ZIP
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 gap-4 px-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 border-b border-slate-100 dark:border-gray-800">
                <span>Original name</span>
                <span>New name</span>
              </div>
              {preview.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4 px-4 py-3 text-sm border-b border-slate-50 dark:border-gray-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-800/50 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{item.original.name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white truncate">{item.newName}</span>
                    <button onClick={() => remove(index)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 transition-all shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Files are packaged in a ZIP with the new names. Your original files are unchanged.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
