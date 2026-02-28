import ToolPageLayout from "@/components/ui/ToolPageLayout";
import PdfSplitTool from "@/components/tools/PdfSplit";
import { Scissors } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF — Filzy",
  description: "Split a PDF into individual pages or custom ranges in your browser.",
};

export default function PdfSplitPage() {
  return (
    <ToolPageLayout
      title="Split PDF"
      description="Split a PDF into individual pages or custom page ranges. Download as a ZIP archive. 100% client-side."
      icon={<Scissors className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-orange-400 to-amber-500"
    >
      <PdfSplitTool />
    </ToolPageLayout>
  );
}
