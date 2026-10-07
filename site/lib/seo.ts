import type {Metadata} from 'next';

// Update the sitemap and robots files alongside this URL when the site moves domains.
export const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||'https://afterlifetheory.netlify.app').replace(/\/$/,'');

export function pageMetadata(title:string,description:string,path:string):Metadata{
  return {
    title,description,
    alternates:{canonical:path},
    openGraph:{type:'website',siteName:'Afterlife Theory Labs',title,description,url:path,locale:'en_IN'},
    twitter:{card:'summary',title,description},
  };
}
