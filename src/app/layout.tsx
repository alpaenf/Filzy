import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Filzy — Smart File Tools",
  description:
    "Compress, convert, merge, split, and process files directly in your browser. No uploads to servers. 100% private and free.",
  keywords: [
    "file tools",
    "image compress",
    "pdf merge",
    "background removal",
    "file converter",
    "online tools",
  ],
  openGraph: {
    title: "Filzy — Smart File Tools",
    description: "Process files directly in your browser. No uploads. 100% private.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-[var(--font-poppins)] antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
