import ToolPageLayout from "@/components/ui/ToolPageLayout";
import GifToVideoTool from "@/components/tools/GifToVideo";
import { Repeat2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GIF to Video — Filzy",
  description: "Convert animated GIFs into MP4 or WebM videos directly in your browser. No uploads required.",
};

export default function GifToVideoPage() {
  return (
    <ToolPageLayout
      title="GIF to Video"
      description="Convert animated GIF files into MP4 or WebM videos. Lightweight and fast — processed entirely in your browser."
      icon={<Repeat2 className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-violet-400 to-purple-600"
    >
      <GifToVideoTool />
    </ToolPageLayout>
  );
}
