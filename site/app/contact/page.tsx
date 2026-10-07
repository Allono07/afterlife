import {pageMetadata} from '@/lib/seo';
import {Suspense} from 'react';
import {ContactExperience} from '@/components/worlds/ContactExperience';
export const metadata=pageMetadata('Start a Conversation — Afterlife Theory Labs','Tell us about your software, AI, branding, animation, or advertising idea.','/contact');
export default function Page(){return <Suspense fallback={<div className="world" aria-busy="true"><p className="world-kicker">Loading</p></div>}><ContactExperience/></Suspense>;}
