"use client";

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
import {WorldShell} from './WorldShell';
import {labs} from './content';

export function LabExperience({kind}:{kind:keyof typeof labs}) {
  const lab=labs[kind];
  const [selected,setSelected]=useState(0);
  const buttons=useRef<(HTMLButtonElement|null)[]>([]);
  useEffect(()=>{
    const sync=()=>{const i=lab.services.findIndex(service=>`#${service.id}`===window.location.hash);if(i>=0)setSelected(i);};
    sync();window.addEventListener('hashchange',sync);
    return()=>window.removeEventListener('hashchange',sync);
  },[lab]);
  const select=(index:number)=>{
    setSelected(index);
    window.history.replaceState(window.history.state,'',`#${lab.services[index].id}`);
  };
  const service=lab.services[selected];
  return <WorldShell image={lab.image} label={lab.name} position={`${45+selected*4}%`}>
    <div className="world-intro">
      <div><Link className="world-kicker back-to-labs" href="/lab"><ArrowLeft size={12}/> WHAT WE DO / {lab.number}</Link><h1>{lab.title[0]}<br/><em>{lab.title[1]}</em></h1></div>
      <p className="world-intro-note">{lab.intro}<span><ArrowDown size={14}/> Choose a path below</span></p>
    </div>
    <section className="service-dock" aria-label={lab.name}>
      <div className="service-path">
        <div className="world-kicker">{lab.name}<span>{String(selected+1).padStart(2,'0')} / 0{lab.services.length}</span></div>
        <div className="service-tabs" role="tablist" aria-label="Explore our services">
          {lab.services.map((item,index)=><button key={item.id} ref={node=>{buttons.current[index]=node;}} role="tab" id={`tab-${item.id}`} aria-controls={`service-${item.id}`} aria-selected={selected===index} tabIndex={selected===index?0:-1} onClick={()=>select(index)} onKeyDown={event=>{
            let next=index;
            if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%lab.services.length;
            else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+lab.services.length-1)%lab.services.length;
            else if(event.key==='Home')next=0;else if(event.key==='End')next=lab.services.length-1;else return;
            event.preventDefault();select(next);buttons.current[next]?.focus();
          }}><span className="path-number">0{index+1}</span><span>{item.label}</span><ArrowUpRight size={17}/></button>)}
        </div>
      </div>
      <div key={service.id} id={`service-${service.id}`} role="tabpanel" aria-labelledby={`tab-${service.id}`} tabIndex={0} className="service-story">
        <h2>{service.title}</h2><p>{service.description}</p>
        <ol className={`service-process process-${kind}`} aria-label="Our approach">{service.steps.map((step,index)=><li key={step}><span className="process-point">{kind==='ads'?['◯','◇','✳'][index]:`0${index+1}`}</span><span>{step}</span></li>)}</ol>
        <p className="service-outcome">{service.outcome}</p>
        <Link className="world-action" href={`/contact?interest=${encodeURIComponent(service.label)}`}>Let’s build this together <ArrowUpRight size={18}/></Link>
      </div>
    </section>
    <Link className="world-switch" href={kind==='software'?'/lab/ads':'/lab/software'}>Explore {kind==='software'?'Media Creation':'Software & AI Solutions'} <ArrowRight size={16}/></Link>
  </WorldShell>;
}
