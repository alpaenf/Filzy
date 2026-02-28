import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PptToPdfTool from "@/components/tools/PptToPdf";
import { Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPT to PDF — Filzy",
  description: "Convert PowerPoint (.pptx) presentations to PDF directly in your browser. No uploads required.",
};

export default function PptToPdfPage() {
  return (
    <ToolPageLayout
      title="PPT to PDF"
      description="Convert PowerPoint (.pptx) presentations into PDF files. Each slide becomes a page — processed entirely in your browser."
      icon={<Layers className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-cyan-400 to-cyan-600"
    >
      <PptToPdfTool />
    </ToolPageLayout>
  );
}
