import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';
import {WorldShell} from './WorldShell';

export function LabGateway(){
  return <WorldShell image="@kepler.webp" label="What we do">
    <div className="world-intro gateway-intro"><div><p className="world-kicker">TWO WORLDS, ONE CURIOSITY</p><h1>Where will your<br/><em>idea take you?</em></h1></div><p className="world-intro-note"><br/>Choose a world to explore.</p></div>
    <div className="lab-portals">
      <Link className="lab-portal" href="/lab/software"><Image src="/assets/worlds/softwarelab.webp" fill sizes="(max-width:700px) 100vw, 50vw" alt="Green highlands, white clouds, and a winding river" unoptimized/><span className="portal-shade"/><span className="portal-top">01 / ENGINEERING </span><span className="portal-bottom"><strong>Software &<br/>AI Solutions</strong><span>Models · Workflows · Products · MVPs</span><span className="portal-enter">Enter the landscape </span></span></Link>
      <Link className="lab-portal" href="/lab/ads"><Image src="/assets/worlds/adlab.webp" fill sizes="(max-width:700px) 100vw, 50vw" alt="Sunlit sandstone beside reflective water beneath white clouds" unoptimized/><span className="portal-shade"/><span className="portal-top">02 / CREATIVE </span><span className="portal-bottom"><strong>Media Content<br/>Creation</strong><span>Animation · Brand identity · Advertising</span><span className="portal-enter">Enter the landscape </span></span></Link>
    </div>
  </WorldShell>;
}
