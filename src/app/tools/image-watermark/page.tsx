import ToolPageLayout from "@/components/ui/ToolPageLayout";
import ImageWatermarkTool from "@/components/tools/ImageWatermark";
import { Stamp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Watermark — Filzy",
  description: "Add custom text watermarks to your images. Control position, opacity, size, rotation, and color. No uploads — all local.",
};

export default function ImageWatermarkPage() {
  return (
    <ToolPageLayout
      title="Image Watermark"
      description="Add text watermarks to your images with full control over position, opacity, font size, rotation, and color. Processing is done entirely in your browser."
      icon={<Stamp className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-pink-400 to-rose-500"
    >
      <ImageWatermarkTool />
    </ToolPageLayout>
  );
}
