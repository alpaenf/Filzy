import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PdfMergeTool from "@/components/tools/PdfMerge";
import { FilePlus2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files — Filzy",
  description: "Combine multiple PDF files into one. Browser-only, no uploads.",
};

export default function PdfMergePage() {
  return (
    <ToolPageLayout
      title="Merge PDF Files"
      description="Combine multiple PDFs into a single document. Reorder files before merging. Processed entirely in your browser."
      icon={<FilePlus2 className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-rose-400 to-red-500"
    >
      <PdfMergeTool />
    </ToolPageLayout>
  );
}
