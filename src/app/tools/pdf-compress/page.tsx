import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PdfCompressTool from "@/components/tools/PdfCompress";
import { Archive } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF — Filzy",
  description: "Reduce PDF file size by optimizing its structure in your browser.",
};

export default function PdfCompressPage() {
  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce PDF file size by removing metadata and optimizing object streams. All processing happens locally in your browser."
      icon={<Archive className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-red-400 to-rose-500"
    >
      <PdfCompressTool />
    </ToolPageLayout>
  );
}
