import {useRef} from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {SUN} from './Earth';
import {SatelliteModel} from './SatelliteModel';

export function Satellite({moving, mobile}: {moving: boolean; mobile:boolean}) {
  const orbit = useRef<THREE.Group>(null);
  const angle = useRef(.06);
  const sunlight=useRef({value:1});
  const relative=useRef(new THREE.Vector3());
  useFrame((_,delta) => {
    if (moving) angle.current += Math.min(delta,.05)*.06*(mobile?3:1);
    if (!orbit.current) return;
    const a=angle.current;
    const centerY=mobile ? -1.62 : -.75;
    orbit.current.position.set((mobile ? 3.4 : 4.1)*Math.cos(a), centerY+1.1*Math.sin(a), 3.5*Math.sin(a));
    // The dish's +Z axis points to Earth; arrays independently track the Sun.
    orbit.current.lookAt(0,centerY,0);
    orbit.current.rotateZ(.65);
    relative.current.copy(orbit.current.position);
    relative.current.y-=centerY;
    const along=relative.current.dot(SUN);
    const distance=Math.sqrt(Math.max(0,relative.current.lengthSq()-along*along));
    // Ray/sphere eclipse with a narrow penumbra; works on mobile without shadow maps.
    sunlight.current.value=along<0?THREE.MathUtils.smoothstep(distance,2.48,2.65):1;
  });
  return <group><group ref={orbit} position={[mobile ? 3.4 : 4.1,mobile ? -1.62 : -.68,.16]}><group scale={mobile?.25:.31}><SatelliteModel sunlight={sunlight}/></group></group></group>;
}
