import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/** The supplied panorama already contains natural rock relief and cast shadows. */
export function Foreground({mobile}: {mobile: boolean}) {
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
export function SeatedBoy({mobile}: {mobile:boolean}) {
  const loadedTexture=useTexture('/assets/boy-cinematic.webp');
  const texture=useMemo(()=>{
    const copy=loadedTexture.clone();
    copy.colorSpace=THREE.SRGBColorSpace;
    copy.anisotropy=4;
    return copy;
  },[loadedTexture]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  // Slightly larger at desktop size so the hair, hood stitching, and fabric
  // folds hold up at normal viewing distance while remaining small vs Earth.
  const size=mobile ? 2 : 2.05;
  return <group position={[0,mobile ? -6.02 : -3.34,3.12]}>
    <mesh position={[0,size*.47,.06]} renderOrder={4}>
      <planeGeometry args={[size,size]}/>
      <meshBasicMaterial map={texture} transparent alphaTest={.025} toneMapped={false} depthWrite={false}/>
    </mesh>
  </group>;
}
