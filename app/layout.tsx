import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interior Architect",
  description: "A local-first, structure-aware generative interior design studio.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
