"use client";

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
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
  const mounted = useSyncExternalStore(subscribeHydration, getMountedSnapshot, getServerMountedSnapshot);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [approached, setApproached] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const approach = () => window.scrollTo({top: window.innerHeight * 1.2, behavior: reduced ? 'instant' : 'smooth'});
  return (
    <div ref={root} className="experience" id="top" data-loading={!ready} aria-busy={!ready}>
      {ready && <a href="#main" className="skip-link">Skip to main content</a>}
      <div className={`scene-wrap ${ready ? 'is-ready' : ''}`} aria-hidden="true">
        <SceneBoundary onError={handleError}>
          {mounted && <Suspense fallback={null}><SpaceScene reduced={reduced} paused={paused} onApproach={setApproached} onReady={handleReady} onError={handleError} /></Suspense>}
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
      <header className={`header reveal${menuOpen ? ' menu-open' : ''}`} inert={!ready}>
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
          {menuOpen ? <X size={19} strokeWidth={1.5}/> : <Menu size={20} strokeWidth={1.5}/>}
        </button>
        <nav id="primary-navigation" aria-label="Main navigation">
          <Link className="home-nav-link" href="/lab" onClick={() => setMenuOpen(false)}>What we do</Link>
          <Link className="home-nav-link" href="/values" onClick={() => setMenuOpen(false)}>Values</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact <ArrowUpRight size={14} strokeWidth={1.5}/></Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1} inert={!ready}>
        <div className="hero-copy">
          <h1 className="reveal">Beyond Binary &amp; <span>Silicon</span></h1>
          <p className="eyebrow reveal">IDEAS FOR A MORE HUMAN TOMORROW</p>
          <button className="hero-explore reveal" onClick={approach}>EXPLORE <ArrowUpRight size={17} strokeWidth={1.5}/></button>
        </div>
        <div className="journey-end" aria-hidden={!approached} inert={!approached}><p>Two worlds.<br/><em>Where will you go?</em></p><div className="home-destinations"><Link href="/lab/software">Software &amp; AI Solutions <ArrowUpRight size={17}/></Link><Link href="/lab/ads">Media Content Creation <ArrowUpRight size={17}/></Link></div><button onClick={() => window.scrollTo({top:0, behavior: reduced ? 'instant' : 'smooth'})}>Return to the horizon <ArrowUpRight size={14}/></button></div>
      </main>
      <footer className="footer reveal" inert={!ready}>
        <button className="motion-button" onClick={() => setPaused(v => !v)} disabled={reduced} aria-label={reduced ? 'Motion reduced by device preference' : paused ? 'Play scene motion' : 'Pause scene motion'} aria-pressed={paused || reduced}>
          {paused || reduced ? <Play size={13}/> : <Pause size={13}/>}<span>{reduced ? 'REDUCED MOTION' : paused ? 'MOTION PAUSED' : 'PAUSE MOTION'}</span>
        </button>
      </footer>
      <div className="scroll-track" aria-hidden="true" />

    </div>
  );
}
