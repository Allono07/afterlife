import type {Metadata} from 'next';

export const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.afterlifetheorylabs.com').replace(/\/$/,'');

export function pageMetadata(title:string,description:string,path:string):Metadata{
  return {
    title,description,
    alternates:{canonical:path},
    openGraph:{type:'website',siteName:'Afterlife Theory Labs',title,description,url:path,locale:'en_IN'},
    twitter:{card:'summary',title,description},
  };
}
