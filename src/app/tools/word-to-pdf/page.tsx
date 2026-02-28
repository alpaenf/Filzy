import ToolPageLayout from "@/components/ui/ToolPageLayout";
import WordToPdfTool from "@/components/tools/WordToPdf";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF — Filzy",
  description: "Convert Word (.docx) files to PDF directly in your browser. No uploads required.",
};

export default function WordToPdfPage() {
  return (
    <ToolPageLayout
      title="Word to PDF"
      description="Convert .docx Word documents into PDF files. Text is laid out on A4 pages — processed entirely in your browser."
      icon={<FileText className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-cyan-400 to-cyan-600"
    >
      <WordToPdfTool />
    </ToolPageLayout>
  );
}
