"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import Image from 'next/image';
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUpRight,Monitor,Pause,Play,Smartphone,X} from 'lucide-react';
import {categoryLabels,projects,type Project,type ProjectCategory} from './projects';

function canPreview(){return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData;}

function PhoneCarousel({project,small=false}:{project:Project;small?:boolean}){
  const images=project.media.filter(item=>item.device==='mobile');
  const track=useRef<HTMLDivElement>(null);
  const [slide,setSlide]=useState(0);
  return <div className={`phone-carousel${small?' phone-carousel-small':''}`} role="region" aria-label={`${project.name} mobile screenshots`}>
    <div ref={track} className="phone-carousel-track" tabIndex={0} onScroll={e=>{const el=e.currentTarget;setSlide(Math.round(el.scrollLeft/el.clientWidth));}} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();track.current?.scrollTo({left:Math.max(0,Math.min(images.length-1,slide+(e.key==='ArrowRight'?1:-1)))*(track.current?.clientWidth||0),behavior:'auto'});}}}>
      {images.map((item,i)=><div className="phone-slide" key={item.src} role="group" aria-label={`${i+1} of ${images.length}`}><Image src={item.src} alt={item.alt} width={660} height={1400} unoptimized draggable={false}/></div>)}
    </div>
    {images.length>1&&<div className="phone-carousel-dots">{images.map((item,i)=><button key={item.src} aria-label={`Show mobile screenshot ${i+1}`} aria-pressed={slide===i} onClick={()=>track.current?.scrollTo({left:i*track.current.clientWidth,behavior:'auto'})}><span/></button>)}</div>}
  </div>;
}

function ProjectCard({project,compact,onOpen}:{project:Project;compact:boolean;onOpen:()=>void}){
  const video=useRef<HTMLVideoElement>(null);
  const [active,setActive]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [playing,setPlaying]=useState(false);
  const [manual,setManual]=useState(false);
  const mobile=project.media.find(item=>item.device==='mobile');
  useEffect(()=>{
    const element=video.current;
    if(!element)return;
    let cancelled=false;
    if(active && (manual||canPreview()))element.play().then(()=>{if(cancelled)element.pause();}).catch(()=>{});else element.pause();
    return()=>{cancelled=true;element.pause();};
  },[active,loaded,manual]);
  useEffect(()=>{
    const element=video.current;
    if(!element)return;
    const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)element.pause();});
    observer.observe(element);
    const hide=()=>{if(document.hidden)element.pause();};
    document.addEventListener('visibilitychange',hide);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);};
  },[loaded]);
  const start=()=>{if(canPreview()){setActive(true);if(project.video)setLoaded(true);}};
  return <article className={`project-card${compact?' is-compact':''}${active?' is-previewing':''}`} style={{'--project-accent':project.accent} as CSSProperties} onPointerEnter={event=>{if(event.pointerType==='mouse')start();}} onPointerLeave={()=>setActive(false)} onFocus={event=>{if(!event.target.closest('.preview-toggle'))start();}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setActive(false);}}>
    <div className="project-stage">
      <div className="project-browser"><div className="browser-chrome" aria-hidden="true"><i/><i/><i/><span>{new URL(project.url).hostname}</span></div><div className="project-screen"><Image src={project.media[0].src} alt={project.media[0].alt} fill sizes={compact?'300px':'(max-width:700px) 90vw, 45vw'} unoptimized/>{project.video&&loaded&&<video ref={video} src={project.video} muted loop playsInline preload="none" aria-hidden="true" className={playing?'is-playing':''} onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/>}</div></div>
      {mobile&&<div className="project-phone"><PhoneCarousel project={project} small/></div>}
      <button className="project-open" onClick={onOpen} aria-label={`View ${project.name} project`}><span>View project <ArrowUpRight size={16}/></span></button>
      {!compact&&project.video&&<button className="preview-toggle" onClick={()=>{if(playing){setActive(false);}else{setManual(true);setLoaded(true);setActive(true);}}} aria-label={`${playing?'Pause':'Play'} ${project.name} preview`} aria-pressed={playing}>{playing?<Pause size={12}/>:<Play size={12}/>}<span>{playing?'Pause preview':'Play preview'}</span></button>}
    </div>
    <div className="project-caption"><div><p>{project.categories.map(item=>categoryLabels[item]).join(' / ')}</p><h3><button onClick={onOpen}>{project.name}</button></h3></div><button className="project-arrow" onClick={onOpen} aria-label={`Explore ${project.name}`}><ArrowUpRight size={22} strokeWidth={1.4}/></button></div>
    {!compact&&<p className="project-summary">{project.summary}</p>}
  </article>;
}

function ProjectDetail({project,onClose}:{project:Project;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [device,setDevice]=useState<'desktop'|'mobile'>(()=>typeof window!=='undefined'&&window.innerWidth<700?'mobile':'desktop');
  const [index,setIndex]=useState(0);
  const [showVideo,setShowVideo]=useState(false);
  const media=project.media.filter(item=>item.device===device);
  const current=media[index]||media[0];
  useEffect(()=>{
    const element=dialog.current;
    const previous=document.body.style.overflow;
    element?.showModal();document.body.style.overflow='hidden';
    return()=>{element?.close();document.body.style.overflow=previous;};
  },[]);
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div className="project-detail">
      <header><span className="world-kicker">SELECTED WORK / {project.categories.map(c=>categoryLabels[c]).join(' + ')}</span><button autoFocus className="detail-close" onClick={onClose} aria-label="Close project"><X size={22}/></button></header>
      <div className="detail-heading"><div><h2 id="project-title">{project.name}</h2><p>{project.summary}</p></div><a href={project.url} target="_blank" rel="noopener noreferrer">Visit website <ArrowUpRight size={17}/></a></div>
      <div className="detail-toolbar"><div role="group" aria-label="Preview device">{(['desktop','mobile'] as const).filter(d=>project.media.some(m=>m.device===d)).map(d=><button key={d} aria-pressed={device===d} onClick={()=>{setDevice(d);setIndex(0);setShowVideo(false);}}>{d==='desktop'?<Monitor size={15}/>:<Smartphone size={15}/>} {d==='desktop'?'Website':project.categories.includes('app')?'App':'Mobile web'}</button>)}</div>{project.video&&device==='desktop'&&<button aria-pressed={showVideo} onClick={()=>setShowVideo(!showVideo)}>{showVideo?'Show screenshots':'Watch recording'} <Play size={13}/></button>}</div>
      <div className={`detail-media detail-${device}`}>{showVideo?<video src={project.video} poster={project.media[0].src} controls playsInline preload="metadata" aria-label={`${project.name} website recording`}/>:device==='mobile'?<PhoneCarousel project={project}/>:<Image src={current.src} alt={current.alt} width={device==='desktop'?1440:660} height={device==='desktop'?810:1400} unoptimized/>}</div>
      <div className="detail-bottom"><span>{showVideo?'Website recording':device==='mobile'?'Swipe to explore · Mobile':`${String(index+1).padStart(2,'0')} / ${String(media.length).padStart(2,'0')} · Desktop`}</span>{!showVideo&&device==='desktop'&&media.length>1&&<div><button aria-label="Previous screenshot" onClick={()=>setIndex((index+media.length-1)%media.length)}><ArrowLeft size={17}/></button><button aria-label="Next screenshot" onClick={()=>setIndex((index+1)%media.length)}><ArrowRight size={17}/></button></div>}</div>
      {project.stack.length>0&&<div className="project-stack"><span>Built with</span>{project.stack.map(tech=><span key={tech}>{tech}</span>)}</div>}
    </div>
  </dialog>;
}

export function ProjectGallery({service,compact=false}:{service?:string;compact?:boolean}){
  const [filter,setFilter]=useState<ProjectCategory|'all'>('all');
  const [opened,setOpened]=useState<Project|null>(null);
  const relevant=projects.filter(project=>!service||project.services.includes(service));
  const categories=[...new Set(relevant.flatMap(project=>project.categories))];
  if(!relevant.length)return null;
  return <section className={`project-gallery${compact?' gallery-compact':''}`} aria-label={compact?'Work in this service':'Selected work'}>
    {!compact?<div className="work-heading"><div><p className="world-kicker"></p><h2>Our Work</h2></div><a href="#solutions">Explore our solutions <ArrowDown size={15}/></a></div>:<p className="world-kicker">EXPLORE OUR WORK</p>}
    {!compact&&<div className="project-filters" role="group" aria-label="Filter projects"><button aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>All work </button>{categories.map(category=><button key={category} aria-pressed={filter===category} onClick={()=>setFilter(category)}>{categoryLabels[category]}</button>)}</div>}
    <div className="project-grid">{relevant.filter(project=>filter==='all'||project.categories.includes(filter)).map(project=><ProjectCard key={project.id} project={project} compact={compact} onOpen={()=>setOpened(project)}/>)}</div>
    {opened&&<ProjectDetail project={opened} onClose={()=>setOpened(null)}/>}
  </section>;
}
