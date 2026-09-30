import { type RefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { EarthFlight } from './flight';

/** The supplied panorama already contains natural rock relief and cast shadows. */
export function Foreground({mobile,flight}: {mobile:boolean;flight:RefObject<EarthFlight>}) {
  const source=useTexture('/assets/lunarsurface.png');
  const plate=useRef<THREE.Mesh>(null);
  const anchor=useMemo(()=>new THREE.Vector3(0,0,3),[]);
  // Place the distant horizon above the boy's seated base, leaving a strip of
  // ground behind his legs as well as the foreground in front of him.
  const horizonY=mobile?-5.42:-2.87;
  const texture=useMemo(()=>{
    const copy=source.clone();
    copy.colorSpace=THREE.SRGBColorSpace;
    copy.anisotropy=8;
    return copy;
  },[source]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useFrame(({viewport,camera})=>{
    if(!plate.current)return;
    (plate.current.material as THREE.MeshBasicMaterial).opacity=1-THREE.MathUtils.smoothstep(flight.current.progress,0,.18);
    plate.current.visible=flight.current.progress<.18;
    const view=viewport.getCurrentViewport(camera,anchor);
    // Cover the lower frame without stretching the panorama on portrait screens.
    const width=Math.max(view.width*1.08,view.height*1.05);
    const height=width/2;
    plate.current.scale.set(width,height,1);
    // The image horizon is approximately 54% down the transparent image.
    plate.current.position.set(0,horizonY+height*.04,3);
  });
  return <mesh ref={plate} position={[0,horizonY,3]} renderOrder={2}>
    <planeGeometry args={[1,1]}/>
    <meshBasicMaterial map={texture} transparent alphaTest={.02} depthWrite color="#ece7de" toneMapped={false}/>
  </mesh>;
}

/** A rear-view photographic character plate keeps the small hero figure natural. */
export function SeatedBoy({mobile,flight}: {mobile:boolean;flight:RefObject<EarthFlight>}) {
  const loadedTexture=useTexture('/assets/astronautboy.webp');
  const texture=useMemo(()=>{
    const copy=loadedTexture.clone();
    copy.colorSpace=THREE.SRGBColorSpace;
    copy.anisotropy=4;
    return copy;
  },[loadedTexture]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  const plate=useRef<THREE.Mesh>(null);
  useFrame(()=>{
    if(!plate.current)return;
    (plate.current.material as THREE.MeshBasicMaterial).opacity=1-THREE.MathUtils.smoothstep(flight.current.progress,0,.18);
    plate.current.visible=flight.current.progress<.18;
  });
  const size=mobile ? 2.3 : 2.35;
  const height=size*1214/1295;
  // The PNG's seated base is 6.5% above its lower edge; align that point to
  // the ground and center the child (the helmet extends to his right).

  return <group position={[0,mobile ? -6.02 : -3.34,3.12]}>
    <mesh ref={plate} position={[size*.08,height*.435,.06]} renderOrder={4}>
      <planeGeometry args={[size,height]}/>
      <meshBasicMaterial map={texture} transparent alphaTest={.025} toneMapped={false} depthWrite={false}/>
    </mesh>
  </group>;
}
