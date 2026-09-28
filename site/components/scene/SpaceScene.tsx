import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { Earth } from './Earth';
import { Satellite } from './Satellite';
import { Foreground, SeatedBoy } from './Foreground';

gsap.registerPlugin(ScrollTrigger);

function CameraRig({reduced, moving, mobile, onApproach}: {reduced:boolean; moving:boolean; mobile:boolean; onApproach:(value:boolean)=>void}) {
  const { camera, invalidate }=useThree();
  const progress=useRef({value:0});
  const cursor=useRef({x:0,y:0});
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const look=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{
    const move=(e:PointerEvent)=> {cursor.current={x:e.clientX/window.innerWidth-.5,y:e.clientY/window.innerHeight-.5};};
    window.addEventListener('pointermove',move,{passive:true});
    const ctx=gsap.context(()=>{
      gsap.to(progress.current,{value:1,ease:'none',scrollTrigger:{trigger:'.experience', start:'top top',end:'bottom bottom',scrub:reduced ? true : 1.2,onUpdate:()=>{invalidate();onApproach(progress.current.value>.6);}}});
      gsap.to('.hero-copy',{opacity:0,y:reduced ? 0:-45,ease:'none',scrollTrigger:{trigger:'.experience',start:'top top',end:'25% top',scrub:true}});
      gsap.to('.journey-end',{opacity:1,pointerEvents:'auto',scrollTrigger:{trigger:'.experience',start:'65% bottom',end:'bottom bottom',scrub:true}});

    });
    return ()=> {window.removeEventListener('pointermove',move);ctx.revert();};
  },[reduced,invalidate,onApproach]);
  useFrame((_,delta)=>{
    const p=reduced ? 0 : progress.current.value;
  const distance=mobile ? 22.5 : 14;
    target.set(moving&&!mobile ? cursor.current.x*.12 : 0, .0 + p*.38 + (moving&&!mobile ? -cursor.current.y*.07 : 0),distance-p*(mobile ? 9 : 6.7));
    camera.position.lerp(target, reduced || !moving ? 1 : 1-Math.exp(-delta*3));
    look.set(0, mobile ? -.65 : -.05,0);
    camera.lookAt(look);
  });
  return null;
}

function Loaded({onReady}: {onReady:()=>void}) {useEffect(()=>onReady(),[onReady]); return null;}

function Unavailable({onError}:{onError:()=>void}) {useEffect(()=>onError(),[onError]);return null;}

export default function SpaceScene({reduced,paused,onReady,onError,onApproach}:{reduced:boolean;paused:boolean;onReady:()=>void;onError:()=>void;onApproach:(value:boolean)=>void}) {
  const [mobile,setMobile]=useState(()=>window.innerWidth<700);
  const [visible,setVisible]=useState(true);
  const [dpr,setDpr]=useState(()=>Math.min(window.devicePixelRatio,mobile ? 1.25 : 1.75));
  const moving=!reduced&&!paused&&visible;
  useEffect(()=>{
    const resize=()=>setMobile(window.innerWidth<700);
    const visibility=()=>setVisible(!document.hidden);
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
    return ()=>{window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return <Canvas shadows={mobile ? false : 'soft'} camera={{position:[0,0,mobile ? 19 : 14],fov:42,near:.1,far:150}} dpr={dpr} frameloop={moving ? 'always' : 'demand'} gl={{antialias:!mobile,powerPreference:'high-performance',alpha:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.02;gl.domElement.addEventListener('webglcontextlost',onError,{once:true});}} fallback={<Unavailable onError={onError}/>}>
    <PerformanceMonitor onDecline={()=>setDpr(1)} flipflops={2} onFallback={()=>setDpr(1)}/>
    <ambientLight intensity={.2}/><directionalLight position={[-8,10,8]} intensity={3.4} color="#e4efff" castShadow={!mobile} shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-.0003}/>
    <hemisphereLight args={['#a2b7cb','#070809',.16]}/>
    <Suspense fallback={null}><Earth moving={moving} mobile={mobile}/><Satellite moving={moving} mobile={mobile}/><Foreground mobile={mobile}/><SeatedBoy mobile={mobile}/><Loaded onReady={onReady}/></Suspense>
    <CameraRig reduced={reduced} moving={moving} mobile={mobile} onApproach={onApproach}/>
  </Canvas>;
}
