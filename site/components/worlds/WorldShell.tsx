"use client";

import {useEffect, useState, type ReactNode, type CSSProperties} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {MenuIcon} from '@/components/navigation/MenuIcon';
import {usePathname} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {discoveryHref,trackConversion,whatsappHref} from '@/lib/contact';

export function WorldShell({children,image='softwarelab',label,position='50%'}:{children:ReactNode;image?:string;label:string;position?:string}) {
  const [menu,setMenu]=useState(false);
  const pathname=usePathname();
  const isExplicitAsset=image.startsWith('@');
  const imageName=isExplicitAsset ? image.slice(1) : image.includes('.') ? image : `${image}.webp`;
  const imageSrc = isExplicitAsset ? `/assets/${imageName}` : `/assets/worlds/${imageName}`;
  const imageClass=image.replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'') || 'softwarelab';
  useEffect(()=>{
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(false);};
    window.addEventListener('keydown',escape);
    return()=>window.removeEventListener('keydown',escape);
  },[]);
  useEffect(()=>{
    const onConversionClick=(event:MouseEvent)=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      const marker=target.closest<HTMLElement>('[data-conversion]')?.dataset.conversion;
      if(!marker)return;
      const [name,detail]=marker.split(':',2);
      trackConversion(name,detail);
    };
    document.addEventListener('click',onConversionClick);
    return()=>document.removeEventListener('click',onConversionClick);
  },[]);
  return <div className={`world world-${imageClass}`} style={{'--landscape-position':position} as CSSProperties}>
    <div className="world-scenery" aria-hidden="true"><Image src={imageSrc} alt="" fill sizes="100vw" priority unoptimized className="world-landscape"/><div className="world-wash"/></div>
    <div className="world-arrival" aria-hidden="true"/>
    <a className="skip-link" href="#destination">Skip to content</a>
    <header className="world-header">
      <Link className="world-home" href="/" aria-label="Return to the Earth scene"><ArrowLeft size={15}/><span>Home</span></Link>
      <Link className="world-brand" href="/">Afterlife <span>Theory</span> Labs</Link>
      <button className="world-menu-toggle" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="world-navigation" onClick={()=>setMenu(!menu)}><MenuIcon open={menu}/></button>
      <nav onClick={()=>setMenu(false)} id="world-navigation" className={`world-nav ${menu?'is-open':''}`} aria-label="Main navigation">
        <Link href="/lab" aria-current={pathname?.startsWith('/lab')?'page':undefined}>What we do</Link>
        <Link href="/values" aria-current={pathname==='/values'?'page':undefined}>Values</Link>
        <Link href="/contact" aria-current={pathname==='/contact'?'page':undefined}>Contact</Link>
        <a className="world-whatsapp-link" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={()=>trackConversion('whatsapp_click','header')}>WhatsApp</a>
      </nav>
    </header>
    <main id="destination" className="world-content" tabIndex={-1}>{children}</main>
    <footer className="world-footer"><span>AFTERLIFE THEORY LABS</span><a href="mailto:allono.at@gmail.com" onClick={()=>trackConversion('email_click','world_footer')}>allono.at@gmail.com</a><span>{label} / BEYOND BINARY & SILICON</span></footer>
    <a className="mobile-whatsapp-cta" href={discoveryHref} target="_blank" rel="noopener noreferrer" onClick={()=>{trackConversion('booking_click','mobile_sticky_whatsapp');trackConversion('whatsapp_click','mobile_sticky');}}><span>Arrange a free 20-min call</span></a>
  </div>;
}
