import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Satellite({moving, mobile}: {moving: boolean; mobile:boolean}) {
  const {scene} = useGLTF('/assets/satellite.glb');
  const model = useMemo(() => {const copy=scene.clone(true); copy.traverse(o=>{if(o instanceof THREE.Mesh) o.geometry.computeVertexNormals();}); return copy;},[scene]);
  const orbit = useRef<THREE.Group>(null);
  const angle = useRef(.06);
  useFrame((_,delta) => {
    if (moving) angle.current += Math.min(delta,.05)*.045;
    if (!orbit.current) return;
    const a=angle.current;
    orbit.current.position.set((mobile ? 3.4 : 4.1)*Math.cos(a), -.5+1.25*Math.sin(a), 2.9*Math.sin(a));
    orbit.current.rotation.set(.38, -.4-a, -.25);
  });
  return <group rotation={[0,0,.18]}><group ref={orbit} position={[3.56,-.05,.63]}><primitive object={model} scale={mobile ? .14 : .22} rotation={[-Math.PI/2,0,0]}/></group></group>;
}
