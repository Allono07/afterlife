"use client";
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
import {WorldShell} from './WorldShell';
import {values} from './content';
import {WorldObject} from './WorldObject';

export function ValuesExperience(){
  const [index,setIndex]=useState(0);
  return <WorldShell image="@values.png" label="Our perspective" position={`${42+index*6}%`}>
    <div className="world-intro"><div><p className="world-kicker">OUR VALUES</p><h1>What keeps<br/><em>us grounded.</em></h1></div><p className="world-intro-note">The beliefs behind the things we build.<br/>Explore one thought at a time.</p></div>
    <section className="values-observatory" aria-label="Our values">
      <div className="value-sculpture"><WorldObject kind="sculpture" selected={index}/><div className="value-selector" aria-label="Choose a value">{values.map((value,i)=><button key={value.title} aria-label={`${i+1}. ${value.title}`} aria-pressed={i===index} onClick={()=>setIndex(i)}>0{i+1}</button>)}</div></div>
      <div className="value-reading" key={index} aria-live="polite" aria-atomic="true"><span className="world-kicker">0{index+1} / 04</span><h2>{values[index].title}</h2><p>{values[index].text}</p><span className="value-note">{values[index].note}</span></div>
      <div className="value-controls"><button aria-label="Previous value" onClick={()=>setIndex((index+3)%4)}><ArrowLeft size={19}/></button><button aria-label="Next value" onClick={()=>setIndex((index+1)%4)}><ArrowRight size={19}/></button></div>
    </section>
    <Link className="world-switch" href="/contact">Let’s make something meaningful <ArrowUpRight size={17}/></Link>
  </WorldShell>;
}
