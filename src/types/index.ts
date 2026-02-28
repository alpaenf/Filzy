import type { LucideIcon } from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  badge?: string;
  category: "image" | "pdf" | "file" | "ai";
}

export interface ProcessedFile {
  originalName: string;
  originalSize: number;
  processedSize?: number;
  url?: string;
  blob?: Blob;
  dataUrl?: string;
}
