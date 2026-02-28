import ToolPageLayout from "@/components/ui/ToolPageLayout";
import BulkRenameTool from "@/components/tools/BulkRename";
import { PenLine } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Rename Files — Filzy",
  description: "Rename multiple files using patterns, prefixes, suffixes, and numbering.",
};

export default function BulkRenamePage() {
  return (
    <ToolPageLayout
      title="Bulk Rename Files"
      description="Rename multiple files at once using prefix, suffix, find & replace, case conversion, and sequential numbering. Download as a ZIP."
      icon={<PenLine className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-amber-400 to-yellow-500"
    >
      <BulkRenameTool />
    </ToolPageLayout>
  );
}
