import type { Metadata } from "next";
import "./globals.css";
import "./worlds.css";
import "./portfolio.css";

export const metadata: Metadata = {
  title: "Afterlife Theory Labs — Beyond Binary & Silicon",
  description: "A human-centered design and engineering studio building AI-enabled software and media for a more human tomorrow.",
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
