"use client";

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import gsap from 'gsap';
import { ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import {useRouter} from 'next/navigation';
import {MenuIcon} from '@/components/navigation/MenuIcon';
import type {EarthFlight} from '@/components/scene/flight';
import Link from 'next/link';

const SpaceScene = lazy(() => import('@/components/scene/SpaceScene'));
const subscribeHydration = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

class SceneBoundary extends Component<{children: ReactNode; onError: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const router=useRouter();
  const [destination,setDestination]=useState<'software'|'ads'|null>(null);
  const flight=useRef<EarthFlight>({active:false,progress:0,direction:1});
  const mounted = useSyncExternalStore(subscribeHydration, getMountedSnapshot, getServerMountedSnapshot);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [approached, setApproached] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const departing=!!destination&&!reduced&&!paused;
  const ready = sceneReady && pageReady && !failed;
  const handleReady = useCallback(() => setSceneReady(true), []);
  const handleError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    let active = true;
    const backdrop = new window.Image();
    backdrop.src = '/assets/space.webp';
    Promise.all([backdrop.decode(), document.fonts.ready]).then(() => {
      if (active) setPageReady(true);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (ready) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = previousOverflow; };
  }, [ready]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal', { opacity: 0, y: reduced ? 0 : 16 }, { opacity: 1, y: 0, duration: reduced ? 0 : 1.5, stagger: .12, ease: 'power2.out' });
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);

  useEffect(()=>{
    if(!destination)return;
    const href=`/lab/${destination}`;
    const flightState=flight.current;
    let cancelled=false;
    let timeline:gsap.core.Timeline|undefined;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const terrain=new window.Image();
    terrain.src=`/assets/worlds/${destination==='software'?'softwarelab':'adlab'}.webp`;
    let timeout:ReturnType<typeof setTimeout>;
    // Decode terrain during the flight so preparation never holds the camera
    // at the launch point. Keep the cloud cover up if decoding is still busy.
    const deadline=new Promise<void>(resolve=>{timeout=setTimeout(resolve,5000);});
    const terrainReady=Promise.race([terrain.decode().catch(()=>{}),deadline]).then(()=>clearTimeout(timeout));
    const land=()=>{void terrainReady.then(()=>{if(!cancelled)router.push(href);});};
    if(reduced || paused){land();}
    else {
      flightState.active=true;
      flightState.progress=0;
      flightState.direction=destination==='software'?1:-1;
      timeline=gsap.timeline({onComplete:land});
      timeline.to(flightState,{progress:1,duration:3.25,ease:'none'},0);
      timeline.to('.departure-ui',{opacity:0,duration:.35,ease:'power2.out'},0);
      timeline.to('.atmosphere-passage',{opacity:1,duration:1.05,ease:'power2.inOut'},2.05);
      timeline.fromTo('.passage-cloud',{scale:.55,rotation:-12},{scale:1.8,rotation:10,duration:1.6,ease:'power2.in'},1.5);
    }
    return()=>{cancelled=true;clearTimeout(timeout);timeline?.kill();flightState.active=false;flightState.progress=0;document.body.style.overflow=previousOverflow;};
  },[destination,flight,paused,reduced,router]);

  const approach = () => window.scrollTo({top: window.innerHeight * 1.2, behavior: reduced ? 'instant' : 'smooth'});
  return (
    <div ref={root} className="experience" data-departing={departing} id="top" data-loading={!ready} aria-busy={!ready}>
      {ready && <a href="#main" className="skip-link">Skip to main content</a>}
      <div className={`scene-wrap ${ready ? 'is-ready' : ''}`} aria-hidden="true">
        <SceneBoundary onError={handleError}>
          {mounted && <Suspense fallback={null}><SpaceScene reduced={reduced} paused={paused} onApproach={setApproached} onReady={handleReady} onError={handleError} flight={flight} departing={departing} /></Suspense>}
        </SceneBoundary>
      </div>
      <div className={`loading-screen${ready ? ' is-dismissed' : ''}`} aria-hidden={ready} inert={ready}>
        <span className="loading-wordmark">Afterlife <em>Theory</em> Labs</span>
        {!failed && <span className="loading-line" aria-hidden="true" />}
        <span className="loading-caption" role="status" aria-live="polite">{failed ? 'Unable to load the scene.' : 'Loading'}</span>
        {failed && <button className="loading-retry" onClick={() => window.location.reload()}>Try again</button>}
      </div>
      <div className="space-backdrop" aria-hidden="true"/>
      <div className="vignette" aria-hidden="true" />
      <header className={`header reveal departure-ui${menuOpen ? ' menu-open' : ''}`} inert={!ready || !!destination}>
        <a href="#top" className="brand" aria-label="Afterlife Theory Labs home">
          Afterlife <span>Theory</span> Labs
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(open => !open)}
        >
          <MenuIcon open={menuOpen}/>
        </button>
        <nav id="primary-navigation" aria-label="Main navigation">
          <Link className="home-nav-link" href="/lab" onClick={() => setMenuOpen(false)}>What we do</Link>
          <Link className="home-nav-link" href="/values" onClick={() => setMenuOpen(false)}>Values</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact <ArrowUpRight size={14} strokeWidth={1.5}/></Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1} inert={!ready || !!destination}>
        <div className="hero-copy departure-ui">
          <h1 className="reveal">Beyond Binary &amp; <span>Silicon</span></h1>
          <p className="eyebrow reveal">IDEAS FOR A MORE HUMAN TOMORROW</p>
          <button className="hero-explore reveal" onClick={approach}>EXPLORE <ArrowUpRight size={17} strokeWidth={1.5}/></button>
        </div>
        <div className="journey-end departure-ui" aria-hidden={!approached} inert={!approached}><p>Two worlds.<br/><em>Where will you go?</em></p><div className="home-destinations" aria-label="Choose a destination">{([{id:'software',label:'Software Solutions',detail:'Engineering & AI'},{id:'ads',label:'Media Content Solutions',detail:'Motion, identity & campaigns'}] as const).map(lab=><Link key={lab.id} href={`/lab/${lab.id}`} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();if(!destination)setDestination(lab.id);}}><span>{lab.label}</span><ArrowRight size={16} strokeWidth={1.4}/></Link>)}</div><button onClick={() => window.scrollTo({top:0, behavior: reduced ? 'instant' : 'smooth'})}>Return to the horizon </button></div>
      </main>
      <footer className="footer reveal departure-ui" inert={!ready || !!destination}>
        <button className="motion-button" onClick={() => setPaused(v => !v)} disabled={reduced} aria-label={reduced ? 'Motion reduced by device preference' : paused ? 'Play scene motion' : 'Pause scene motion'} aria-pressed={paused || reduced}>
          {paused || reduced ? <Play size={13}/> : <Pause size={13}/>}<span>{reduced ? 'REDUCED MOTION' : paused ? 'MOTION PAUSED' : 'PAUSE MOTION'}</span>
        </button>
      </footer>
      <div className="atmosphere-passage" aria-hidden="true"><div className="passage-cloud"/></div>
      <span className="sr-only" role="status">{destination?`Entering ${destination==='software'?'Software Solutions':'Ad Solutions'}`:''}</span>
      <div className="scroll-track" aria-hidden="true" />

    </div>
  );
}
