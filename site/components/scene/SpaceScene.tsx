import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { addAfterEffect, Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { Earth } from './Earth';
import { Satellite } from './Satellite';
import { Foreground, SeatedBoy } from './Foreground';

gsap.registerPlugin(ScrollTrigger);
// Mobile browser chrome resizing should not repeatedly rebuild scroll measurements.
ScrollTrigger.config({ignoreMobileResize:true});

function CameraRig({reduced, moving, mobile, onApproach}: {reduced:boolean; moving:boolean; mobile:boolean; onApproach:(value:boolean)=>void}) {
  const { camera, invalidate }=useThree();
  const progress=useRef({value:0});
  const cursor=useRef({x:0,y:0});
  const approached=useRef(false);
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const look=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{
    const move=(e:PointerEvent)=> {cursor.current={x:e.clientX/window.innerWidth-.5,y:e.clientY/window.innerHeight-.5};};
    window.addEventListener('pointermove',move,{passive:true});
    const ctx=gsap.context(()=>{
      gsap.to(progress.current,{value:1,ease:'none',scrollTrigger:{trigger:'.experience', start:'top top',end:'bottom bottom',scrub:true,onUpdate:()=>invalidate()}});
      gsap.to('.hero-copy',{opacity:0,y:reduced ? 0:-45,ease:'none',scrollTrigger:{trigger:'.experience',start:'top top',end:'25% top',scrub:true}});
      gsap.to('.journey-end',{opacity:1,pointerEvents:'auto',scrollTrigger:{trigger:'.experience',start:'65% bottom',end:'bottom bottom',scrub:true}});

    });
    return ()=> {window.removeEventListener('pointermove',move);ctx.revert();};
  },[reduced,invalidate,onApproach]);
  useFrame((_,delta)=>{
    const nextApproached=progress.current.value>.6;
    if(nextApproached!==approached.current){approached.current=nextApproached;onApproach(nextApproached);}
    const p=reduced ? 0 : progress.current.value;
  const distance=mobile ? 22.5 : 14;
    target.set(moving&&!mobile ? cursor.current.x*.12 : 0, .0 + p*.38 + (moving&&!mobile ? -cursor.current.y*.07 : 0),distance-p*(mobile ? 9 : 6.7));
    camera.position.lerp(target, reduced ? 1 : 1-Math.exp(-Math.min(delta,.05)*9));
    look.set(0, mobile ? -.65 : -.05,0);
    camera.lookAt(look);
    // Continue damping when the scene is paused and uses demand rendering.
    if(!reduced && camera.position.distanceToSquared(target)>.000001)invalidate();
  });
  return null;
}

function Loaded({onReady}: {onReady:()=>void}) {
  const rendered = useRef(false);
  const { gl, invalidate } = useThree();
  useFrame(() => { rendered.current = true; });
  useEffect(() => {
    let reported = false;
    // This component commits only after the shared asset Suspense resolves.
    // After-effects run after Three has rendered, including demand-mode frames.
    const unsubscribe = addAfterEffect(() => {
      if (reported || !rendered.current || gl.getContext().isContextLost()) return;
      reported = true;
      onReady();
    });
    invalidate();
    return unsubscribe;
  }, [gl, invalidate, onReady]);
  return null;
}

function ContextEvents({onError}: {onError:()=>void}) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = () => onError();
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

export default function SpaceScene({reduced,paused,onReady,onError,onApproach}:{reduced:boolean;paused:boolean;onReady:()=>void;onError:()=>void;onApproach:(value:boolean)=>void}) {
  const [mobile,setMobile]=useState(()=>window.innerWidth<700);
  const [visible,setVisible]=useState(true);
  const [dpr,setDpr]=useState(()=>Math.min(window.devicePixelRatio,2));
  const moving=!reduced&&!paused&&visible;
  useEffect(()=>{
    const resize=()=>setMobile(window.innerWidth<700);
    const visibility=()=>setVisible(!document.hidden);
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
    return ()=>{window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return <Canvas shadows={mobile ? false : 'soft'} camera={{position:[0,0,mobile ? 22.5 : 14],fov:42,near:.1,far:150}} dpr={dpr} frameloop={moving ? 'always' : 'demand'} resize={{scroll:false,debounce:{scroll:0,resize:120}}} gl={{antialias:true,powerPreference:'high-performance',alpha:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.02;}} fallback={<span>This scene requires WebGL.</span>}>
    <ContextEvents onError={onError}/>
    {moving && <PerformanceMonitor ms={300} iterations={10} bounds={()=>[45,58]}
      onDecline={()=>setDpr(value=>Math.min(window.devicePixelRatio,Math.max(1.5,value-.25)))}
      onIncline={()=>setDpr(value=>Math.min(window.devicePixelRatio,2,value+.25))}/>}
    <ambientLight intensity={.2}/><directionalLight position={[-8,10,8]} intensity={3.4} color="#e4efff" castShadow={!mobile} shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-.0003}/>
    <hemisphereLight args={['#a2b7cb','#070809',.16]}/>
    <Suspense fallback={null}><Earth moving={moving} mobile={mobile}/><Satellite moving={moving} mobile={mobile}/><Foreground mobile={mobile}/><SeatedBoy mobile={mobile}/><Loaded onReady={onReady}/></Suspense>
    <CameraRig reduced={reduced} moving={moving} mobile={mobile} onApproach={onApproach}/>
  </Canvas>;
}
