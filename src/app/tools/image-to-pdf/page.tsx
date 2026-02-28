import ToolPageLayout from "@/components/ui/ToolPageLayout";
import ImageToPdfTool from "@/components/tools/ImageToPdf";
import { Images } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF — Filzy",
  description: "Convert JPG, PNG, and WEBP images to a PDF file. Browser-only, no uploads.",
};

export default function ImageToPdfPage() {
  return (
    <ToolPageLayout
      title="Image to PDF"
      description="Convert one or multiple images into a single PDF. Reorder, set page size and margins. Processed entirely in your browser."
      icon={<Images className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-sky-400 to-indigo-500"
    >
      <ImageToPdfTool />
    </ToolPageLayout>
  );
}
