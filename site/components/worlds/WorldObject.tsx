"use client";
import {Component,lazy,Suspense,useEffect,useRef,useState,type ReactNode} from 'react';

const ObjectScene=lazy(()=>import('./three/ObjectScene'));
class ObjectBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<span className="object-fallback">Explore the details below.</span>:this.props.children;}
}
export function WorldObject({kind,selected=0}:{kind:'terrain'|'sculpture'|'india';selected?:number}){
  const root=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const [reduced,setReduced]=useState(true);
  const [turn,setTurn]=useState(0);
  const drag=useRef<{x:number;turn:number}|null>(null);
  const rotate=(value:number)=>setTurn(kind==='india'?Math.max(-.45,Math.min(.45,value)):value);
  useEffect(()=>{
    const element=root.current;if(!element)return;
    const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{rootMargin:'100px'});observer.observe(element);
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);
    return()=>{observer.disconnect();media.removeEventListener('change',sync);};
  },[]);
  const label=kind==='india'?'Three-dimensional map of India with Bengaluru marked':kind==='sculpture'?'Limestone sculpture representing our values':'Highland terrain with an interactive service model';
  return <div ref={root} className={`world-object object-${kind}`}>
    <div className="object-canvas" role="group" tabIndex={0} aria-label={`${label}. Drag horizontally or use left and right arrow keys to rotate.`}
      onPointerDown={e=>{if(e.button!==0)return;drag.current={x:e.clientX,turn};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{if(drag.current)rotate(drag.current.turn+(e.clientX-drag.current.x)*.008);}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
      onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(turn+(e.key==='ArrowLeft'?-.15:.15));}}}>
      {visible&&<ObjectBoundary><Suspense fallback={<span className="object-fallback">Loading scene</span>}><ObjectScene kind={kind} turn={turn} selected={selected} reduced={reduced}/></Suspense></ObjectBoundary>}
    </div>
    {/* <div className="object-controls"><span>{kind==='india'?'BENGALURU / 12.97° N, 77.59° E':'EXPLORE THE PERSPECTIVE'}</span><span>DRAG TO ROTATE</span></div> */}
  </div>;
}
