import ToolPageLayout from "@/components/ui/ToolPageLayout";
import ImageCompressTool from "@/components/tools/ImageCompress";
import { Minimize2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress & Resize Images — Filzy",
  description: "Compress JPG, PNG, WEBP images directly in your browser without uploading.",
};

export default function ImageCompressPage() {
  return (
    <ToolPageLayout
      title="Compress & Resize Images"
      description="Reduce image file size while preserving quality. Supports JPG, PNG, and WEBP. Processed entirely in your browser."
      icon={<Minimize2 className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-sky-400 to-blue-500"
    >
      <ImageCompressTool />
    </ToolPageLayout>
  );
}
