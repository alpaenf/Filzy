"use client";

import {
  Minimize2,
  ArrowLeftRight,
  Wand2,
  FilePlus2,
  Scissors,
  Archive,
  PenLine,
  BarChart3,
  Images,
  FileImage,
  Clapperboard,
  Repeat2,
  Music,
  FileText,
  FileOutput,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ToolCard from "./ToolCard";
import type { Tool } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const toolIcons: Record<string, LucideIcon> = {
  "image-compress": Minimize2,
  "image-convert": ArrowLeftRight,
  "remove-bg": Wand2,
  "image-to-pdf": Images,
  "pdf-to-image": FileImage,
  "pdf-merge": FilePlus2,
  "pdf-split": Scissors,
  "pdf-compress": Archive,
  "bulk-rename": PenLine,
  "file-info": BarChart3,
  "video-to-gif": Clapperboard,
  "gif-to-video": Repeat2,
  "video-to-mp3": Music,
  "pdf-to-word": FileText,
  "word-to-pdf": FileOutput,
};

const toolMeta = [
  { id: "image-compress", href: "/tools/image-compress", gradient: "from-cyan-400 to-cyan-600", category: "image" as const },
  { id: "image-convert", href: "/tools/image-convert", gradient: "from-cyan-400 to-cyan-600", category: "image" as const },
  { id: "remove-bg", href: "/tools/remove-bg", gradient: "from-cyan-400 to-cyan-600", category: "ai" as const, badge: "AI" },
  { id: "image-to-pdf", href: "/tools/image-to-pdf", gradient: "from-cyan-400 to-cyan-600", category: "image" as const },
  { id: "pdf-to-image", href: "/tools/pdf-to-image", gradient: "from-cyan-400 to-cyan-600", category: "pdf" as const },
  { id: "pdf-merge", href: "/tools/pdf-merge", gradient: "from-cyan-400 to-cyan-600", category: "pdf" as const },
  { id: "pdf-split", href: "/tools/pdf-split", gradient: "from-cyan-400 to-cyan-600", category: "pdf" as const },
  { id: "pdf-compress", href: "/tools/pdf-compress", gradient: "from-cyan-400 to-cyan-600", category: "pdf" as const },
  { id: "bulk-rename", href: "/tools/bulk-rename", gradient: "from-cyan-400 to-cyan-600", category: "file" as const },
  { id: "file-info", href: "/tools/file-info", gradient: "from-cyan-400 to-cyan-600", category: "file" as const },
  { id: "video-to-gif", href: "/tools/video-to-gif", gradient: "from-cyan-400 to-cyan-600", category: "video" as const },
  { id: "gif-to-video", href: "/tools/gif-to-video", gradient: "from-cyan-400 to-cyan-600", category: "video" as const },
  { id: "video-to-mp3", href: "/tools/video-to-mp3", gradient: "from-cyan-400 to-cyan-600", category: "video" as const },
  { id: "pdf-to-word", href: "/tools/pdf-to-word", gradient: "from-cyan-400 to-cyan-600", category: "pdf" as const },
  { id: "word-to-pdf", href: "/tools/word-to-pdf", gradient: "from-cyan-400 to-cyan-600", category: "pdf" as const },
];

export default function ToolGrid() {
  const { t } = useLanguage();

  const tools: Tool[] = toolMeta.map((meta) => ({
    ...meta,
    icon: toolIcons[meta.id],
    title: t.tools.items[meta.id as keyof typeof t.tools.items].title,
    description: t.tools.items[meta.id as keyof typeof t.tools.items].description,
  }));

  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-500 mb-3">
            {t.tools.sectionLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.tools.heading1}{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              {t.tools.heading2}
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {t.tools.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
