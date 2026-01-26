import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sparken Document Branding",
  description: "Apply professional Sparken branding to your documents with logo, watermark, headers, and footers in brand colors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
