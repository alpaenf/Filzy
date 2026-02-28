import ToolPageLayout from "@/components/ui/ToolPageLayout";
import VideoToGifTool from "@/components/tools/VideoToGif";
import { Clapperboard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to GIF — Filzy",
  description: "Convert MP4, WebM, or MOV videos to animated GIFs directly in your browser. No uploads required.",
};

export default function VideoToGifPage() {
  return (
    <ToolPageLayout
      title="Video to GIF"
      description="Convert MP4, WebM, or MOV clips into animated GIFs. Control FPS, resolution, and clip duration — all processed locally in your browser."
      icon={<Clapperboard className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-violet-400 to-purple-600"
    >
      <VideoToGifTool />
    </ToolPageLayout>
  );
}
