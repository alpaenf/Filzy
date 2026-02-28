import ToolPageLayout from "@/components/ui/ToolPageLayout";
import ImageConvertTool from "@/components/tools/ImageConvert";
import { ArrowLeftRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Image Format — Filzy",
  description: "Convert images between JPG, PNG, and WEBP formats in your browser.",
};

export default function ImageConvertPage() {
  return (
    <ToolPageLayout
      title="Convert Image Format"
      description="Convert between JPG, PNG, and WEBP formats. All processing happens locally in your browser."
      icon={<ArrowLeftRight className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-cyan-400 to-teal-500"
    >
      <ImageConvertTool />
    </ToolPageLayout>
  );
}
