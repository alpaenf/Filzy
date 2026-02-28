import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PdfToWordTool from "@/components/tools/PdfToWord";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word — Filzy",
  description: "Convert PDF files to editable Word (.docx) documents directly in your browser. No uploads required.",
};

export default function PdfToWordPage() {
  return (
    <ToolPageLayout
      title="PDF to Word"
      description="Extract text from PDF and convert to an editable .docx file. Processed entirely in your browser — no uploads, no server."
      icon={<FileText className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-cyan-400 to-cyan-600"
    >
      <PdfToWordTool />
    </ToolPageLayout>
  );
}
