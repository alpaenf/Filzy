import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PdfToImageTool from "@/components/tools/PdfToImage";
import { FileImage } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image — Filzy",
  description: "Convert PDF pages to high-quality JPEG or PNG images. Browser-only, no uploads.",
};

export default function PdfToImagePage() {
  return (
    <ToolPageLayout
      title="PDF to Image"
      description="Convert each PDF page into a JPEG or PNG image. Adjust resolution and quality. Download individually or as ZIP."
      icon={<FileImage className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-fuchsia-400 to-pink-500"
    >
      <PdfToImageTool />
    </ToolPageLayout>
  );
}
