import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileHashTool from "@/components/tools/FileHash";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Hash Calculator — Filzy",
  description: "Calculate SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any file using the browser's Web Crypto API. Files never leave your device.",
};

export default function FileHashPage() {
  return (
    <ToolPageLayout
      title="File Hash Calculator"
      description="Verify file integrity by computing SHA-1, SHA-256, SHA-384, or SHA-512 checksums. Uses the browser's built-in Web Crypto API — your files never leave your device."
      icon={<ShieldCheck className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-cyan-400 to-cyan-600"
    >
      <FileHashTool />
    </ToolPageLayout>
  );
}
