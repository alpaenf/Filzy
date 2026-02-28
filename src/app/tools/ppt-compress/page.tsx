import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PptCompressTool from "@/components/tools/PptCompress";
import { Minimize2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PPT — Filzy",
  description: "Reduce PowerPoint (.pptx) file size by re-compressing and removing unnecessary data — all in your browser.",
};

export default function PptCompressPage() {
  return (
    <ToolPageLayout
      title="Compress PPT"
      description="Reduce .pptx file size using maximum DEFLATE compression and optional thumbnail removal. Processed entirely in your browser."
      icon={<Minimize2 className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-cyan-400 to-cyan-600"
    >
      <PptCompressTool />
    </ToolPageLayout>
  );
}
