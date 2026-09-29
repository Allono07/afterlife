import type { Metadata } from "next";
import "./globals.css";
import "./worlds.css";

export const metadata: Metadata = {
  title: "Afterlife Theory Labs — Beyond Binary & Silicon",
  description: "A different frame of reference. Explore a world beyond binary thinking and silicon with Afterlife Theory Labs.",
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
