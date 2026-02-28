import ToolPageLayout from "@/components/ui/ToolPageLayout";
import RemoveBgTool from "@/components/tools/RemoveBg";
import { Wand2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Remove Background — Filzy",
  description: "Remove image backgrounds automatically using AI, directly in your browser. No uploads.",
};

export default function RemoveBgPage() {
  return (
    <ToolPageLayout
      title="AI Remove Background"
      description="Automatically remove the background from any image using AI. Runs 100% in your browser — no server, no uploads, completely private."
      icon={<Wand2 className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-violet-400 to-purple-600"
    >
      <RemoveBgTool />
    </ToolPageLayout>
  );
}
