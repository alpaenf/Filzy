import ToolPageLayout from "@/components/ui/ToolPageLayout";
import QrGeneratorTool from "@/components/tools/QrGenerator";
import { QrCode } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator — Filzy",
  description: "Generate QR codes from any URL, text, email, or phone number. Customize colors, size, and download as PNG or SVG.",
};

export default function QrCodePage() {
  return (
    <ToolPageLayout
      title="QR Code Generator"
      description="Generate custom QR codes from URLs, text, email, phone, or WiFi credentials. Customize colors and download as PNG or SVG — all in your browser."
      icon={<QrCode className="w-7 h-7 text-white" strokeWidth={1.75} />}
      gradient="from-violet-400 to-purple-600"
    >
      <QrGeneratorTool />
    </ToolPageLayout>
  );
}
