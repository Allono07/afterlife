import {pageMetadata} from '@/lib/seo';
import {Suspense} from 'react';
import {ContactExperience} from '@/components/worlds/ContactExperience';
export const metadata=pageMetadata('Contact Afterlife Theory Labs — Start a Project','Talk with our Bengaluru studio about software, AI workflows, websites, apps, animation, branding, or advertising.','/contact');
export default function Page(){return <Suspense fallback={<div className="world" aria-busy="true"><p className="world-kicker">Loading</p></div>}><ContactExperience/></Suspense>;}
