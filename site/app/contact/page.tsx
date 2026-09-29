import {Suspense} from 'react';
import {ContactExperience} from '@/components/worlds/ContactExperience';
export const metadata={title:'Start a Conversation — Afterlife Theory Labs',description:'Tell us about your software, AI, branding, animation, or advertising idea.'};
export default function Page(){return <Suspense fallback={<div className="world" aria-busy="true"><p className="world-kicker">Loading</p></div>}><ContactExperience/></Suspense>;}
