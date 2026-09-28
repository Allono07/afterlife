"use client";

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const SpaceScene = lazy(() => import('@/components/scene/SpaceScene'));

class SceneBoundary extends Component<{children: ReactNode; onError: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [approached, setApproached] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [panel, setPanel] = useState<'Work' | 'About' | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync(); setMounted(true); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal', { opacity: 0, y: reduced ? 0 : 16 }, { opacity: 1, y: 0, duration: reduced ? 0 : 1.5, stagger: .12, ease: 'power2.out' });
    }, root);
    return () => ctx.revert();
  }, [mounted, reduced]);

  const approach = () => window.scrollTo({top: window.innerHeight * 1.2, behavior: reduced ? 'instant' : 'smooth'});
  return (
    <div ref={root} className="experience" id="top">
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className={`scene-wrap ${ready && !failed ? 'is-ready' : ''}`} aria-hidden="true">
        <SceneBoundary onError={() => setFailed(true)}>
          {mounted && <Suspense fallback={null}><SpaceScene reduced={reduced} paused={paused || panel !== null} onApproach={setApproached} onReady={() => {setReady(true); setFailed(false);}} onError={() => setFailed(true)} /></Suspense>}
        </SceneBoundary>
      </div>
      {!ready && !failed && <div className="loading" role="status"><span className="loading-line" />Finding a new perspective</div>}
      {failed && <div className="scene-fallback" role="status"><p>A little perspective changes everything.</p><small>The 3D scene is unavailable on this device.</small><button onClick={() => window.location.reload()}>Try again</button></div>}
      <div className="space-backdrop" aria-hidden="true"/>
      <div className="vignette" aria-hidden="true" />
      <header className="header reveal">
        <a href="#top" className="brand" aria-label="Afterlife Theory Labs home">
          Afterlife <span>Theory</span> Labs
        </a>
        <nav aria-label="Main navigation">
          {(['Work', 'About'] as const).map(item => <button key={item} onClick={() => setPanel(item)}>{item}</button>)}
          <a href="mailto:allono.at@gmail.com">Contact</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="hero-copy">
          <h1 className="reveal">Beyond Binary &amp; <span>Silicon</span></h1>
          <p className="eyebrow reveal">IDEAS FOR A MORE HUMAN TOMORROW</p>
          <button className="hero-explore reveal" onClick={approach}>EXPLORE <ArrowRight size={16} strokeWidth={1.3}/></button>
        </div>
        <div className="journey-end" aria-hidden={!approached} inert={!approached}><p>A little distance.<br/><em>A different perspective.</em></p><button onClick={() => window.scrollTo({top:0, behavior: reduced ? 'instant' : 'smooth'})}>Return to the horizon <ArrowUpRight size={14}/></button></div>
      </main>
      <footer className="footer reveal">
        <button className="motion-button" onClick={() => setPaused(v => !v)} disabled={reduced} aria-label={reduced ? 'Motion reduced by device preference' : paused ? 'Play scene motion' : 'Pause scene motion'} aria-pressed={paused || reduced}>
          {paused || reduced ? <Play size={13}/> : <Pause size={13}/>}<span>{reduced ? 'REDUCED MOTION' : paused ? 'MOTION PAUSED' : 'PAUSE MOTION'}</span>
        </button>
      </footer>
      <div className="scroll-track" aria-hidden="true" />
      <Dialog open={panel !== null} onOpenChange={open => !open && setPanel(null)}>
        <DialogContent className="info-panel">
          <span className="panel-kicker">AFTERLIFE THEORY LABS / {panel?.toUpperCase()}</span>
          <DialogTitle>{panel === 'Work' ? 'Ideas beyond the expected.' : 'A different perspective.'}</DialogTitle>
          <DialogDescription>{panel === 'Work' ? 'Explorations at the meeting point of human curiosity, technology, and the natural world.' : 'Afterlife Theory Labs explores what lies beyond binary thinking and silicon. A space for asking bigger questions—and imagining what comes next.'}</DialogDescription>
          {panel === 'Work' && <button className="panel-project" onClick={() => {setPanel(null); approach();}}><span><small>EXPERIMENT 001</small>The overview effect</span><ArrowUpRight size={22}/></button>}
          {panel === 'About' && <><p className="panel-signature">Beyond Binary &amp; Silicon.</p><p className="credits">Earth maps: <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a>, CC BY 4.0. Lunar material: <a href="https://polyhaven.com/a/moon_01" target="_blank" rel="noreferrer">Poly Haven</a>, CC0. Color and resolution adapted for this scene.</p></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
