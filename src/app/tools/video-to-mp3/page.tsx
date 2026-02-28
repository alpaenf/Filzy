import ToolPageLayout from "@/components/ui/ToolPageLayout";
import VideoToMp3Tool from "@/components/tools/VideoToMp3";
import { Music } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to MP3 — Filzy",
  description: "Extract audio from MP4, WebM, or MOV videos and save as MP3. No uploads, runs fully in browser.",
};

export default function VideoToMp3Page() {
  return (
    <ToolPageLayout
      title="Video to MP3"
      description="Extract and download audio from MP4, WebM, or MOV videos as high-quality MP3. Choose bitrate and process multiple files — all in your browser."
      icon={<Music className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-violet-400 to-purple-600"
    >
      <VideoToMp3Tool />
    </ToolPageLayout>
  );
}
