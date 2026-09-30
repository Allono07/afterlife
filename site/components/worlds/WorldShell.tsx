"use client";

import {useEffect, useState, type ReactNode, type CSSProperties} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {MenuIcon} from '@/components/navigation/MenuIcon';
import {usePathname} from 'next/navigation';
import {ArrowLeft, ArrowUpRight} from 'lucide-react';

export function WorldShell({children,image='softwarelab',label,position='50%'}:{children:ReactNode;image?:string;label:string;position?:string}) {
  const [menu,setMenu]=useState(false);
  const pathname=usePathname();
  useEffect(()=>{
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(false);};
    window.addEventListener('keydown',escape);
    return()=>window.removeEventListener('keydown',escape);
  },[]);
  return <div className={`world world-${image}`} style={{'--landscape-position':position} as CSSProperties}>
    <div className="world-scenery" aria-hidden="true"><Image src={`/assets/worlds/${image}.webp`} alt="" fill sizes="100vw" priority unoptimized className="world-landscape"/><div className="world-wash"/></div>
    <div className="world-arrival" aria-hidden="true"/>
    <a className="skip-link" href="#destination">Skip to content</a>
    <header className="world-header">
      <Link className="world-home" href="/" aria-label="Return to the Earth scene"><ArrowLeft size={15}/><span>Home</span></Link>
      <Link className="world-brand" href="/">Afterlife <span>Theory</span> Labs</Link>
      <button className="world-menu-toggle" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="world-navigation" onClick={()=>setMenu(!menu)}><MenuIcon open={menu}/></button>
      <nav onClick={()=>setMenu(false)} id="world-navigation" className={`world-nav ${menu?'is-open':''}`} aria-label="Main navigation">
        <Link href="/lab" aria-current={pathname?.startsWith('/lab')?'page':undefined}>What we do</Link>
        <Link href="/values" aria-current={pathname==='/values'?'page':undefined}>Values</Link>
        <Link href="/contact" aria-current={pathname==='/contact'?'page':undefined}>Contact <ArrowUpRight size={13}/></Link>
      </nav>
    </header>
    <main id="destination" className="world-content" tabIndex={-1}>{children}</main>
    <footer className="world-footer"><span>AFTERLIFE THEORY LABS</span><span>{label} / BEYOND BINARY & SILICON</span></footer>
  </div>;
}
