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
} from "lucide-react";
import ToolCard from "./ToolCard";
import type { Tool } from "@/types";

const tools: Tool[] = [
  {
    id: "image-compress",
    title: "Compress & Resize Image",
    description: "Reduce image file size while maintaining quality. Supports JPG, PNG, and WEBP formats.",
    icon: Minimize2,
    href: "/tools/image-compress",
    gradient: "from-sky-400 to-blue-500",
    category: "image",
  },
  {
    id: "image-convert",
    title: "Convert Image Format",
    description: "Convert between JPG, PNG, WEBP, and more. Fast and lossless conversion in browser.",
    icon: ArrowLeftRight,
    href: "/tools/image-convert",
    gradient: "from-cyan-400 to-teal-500",
    category: "image",
  },
  {
    id: "remove-bg",
    title: "AI Remove Background",
    description: "Automatically remove image backgrounds using AI — no uploads, runs entirely in your browser.",
    icon: Wand2,
    href: "/tools/remove-bg",
    gradient: "from-violet-400 to-purple-600",
    category: "ai",
    badge: "AI",
  },
  {
    id: "pdf-merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one. Drag to reorder pages before merging.",
    icon: FilePlus2,
    href: "/tools/pdf-merge",
    gradient: "from-rose-400 to-red-500",
    category: "pdf",
  },
  {
    id: "pdf-split",
    title: "Split PDF",
    description: "Split a PDF into individual pages or custom page ranges with ease.",
    icon: Scissors,
    href: "/tools/pdf-split",
    gradient: "from-orange-400 to-amber-500",
    category: "pdf",
  },
  {
    id: "pdf-compress",
    title: "Compress PDF",
    description: "Reduce PDF file size by optimizing embedded images and removing metadata.",
    icon: Archive,
    href: "/tools/pdf-compress",
    gradient: "from-red-400 to-rose-500",
    category: "pdf",
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Convert JPG, PNG, or WEBP images into a PDF. Set page size, orientation, and margins.",
    icon: Images,
    href: "/tools/image-to-pdf",
    gradient: "from-sky-400 to-indigo-500",
    category: "image",
  },
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert PDF pages to high-quality JPEG or PNG images. Adjust resolution and download as ZIP.",
    icon: FileImage,
    href: "/tools/pdf-to-image",
    gradient: "from-fuchsia-400 to-pink-500",
    category: "pdf",
  },
  {
    id: "bulk-rename",
    title: "Bulk Rename Files",
    description: "Rename multiple files at once using patterns, prefixes, suffixes, and numbering.",
    icon: PenLine,
    href: "/tools/bulk-rename",
    gradient: "from-amber-400 to-yellow-500",
    category: "file",
  },
  {
    id: "file-info",
    title: "File Info & Converter",
    description: "View detailed file metadata and convert file size units — KB, MB, GB, TB.",
    icon: BarChart3,
    href: "/tools/file-info",
    gradient: "from-emerald-400 to-green-500",
    category: "file",
  },
];

export default function ToolGrid() {
  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-500 mb-3">
            All Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
              right here
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            All tools run entirely in your browser. No sign-up, no ads, no file uploads to servers.
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
