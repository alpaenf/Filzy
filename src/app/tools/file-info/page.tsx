import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileInfoTool from "@/components/tools/FileInfo";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Info & Size Converter — Filzy",
  description: "View detailed file metadata and convert between file size units.",
};

export default function FileInfoPage() {
  return (
    <ToolPageLayout
      title="File Info & Size Converter"
      description="View detailed metadata for any file and convert between file size units (B, KB, MB, GB, TB) instantly."
      icon={<BarChart3 className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-emerald-400 to-green-500"
    >
      <FileInfoTool />
    </ToolPageLayout>
  );
}
