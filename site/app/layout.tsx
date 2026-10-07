import type { Metadata } from "next";
import "./globals.css";
import "./worlds.css";
import "./portfolio.css";
import {siteUrl} from '@/lib/seo';

export const metadata: Metadata = {
  title: "Afterlife Theory Labs — Beyond Binary & Silicon",
  description: "A human-centered design and engineering studio building AI-enabled software and media for a more human tomorrow.",
  metadataBase:new URL(siteUrl),
  alternates:{canonical:'/'},
  openGraph:{type:'website',siteName:'Afterlife Theory Labs',title:'Afterlife Theory Labs — Beyond Binary & Silicon',description:'Software engineering, AI solutions, and creative media from Afterlife Theory Labs.',url:'/',locale:'en_IN'},
  twitter:{card:'summary',title:'Afterlife Theory Labs — Beyond Binary & Silicon',description:'Software engineering, AI solutions, and creative media.'},
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
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          '@context':'https://schema.org','@type':'Organization',name:'Afterlife Theory Labs',url:siteUrl,
          email:'allono.at@gmail.com',description:'Software engineering, AI solutions, and creative media studio based in Bengaluru, India.',
          areaServed:{'@type':'Place',name:'Bengaluru, Karnataka, India'},
        })}}/>
        {children}
      </body>
    </html>
  );
}
