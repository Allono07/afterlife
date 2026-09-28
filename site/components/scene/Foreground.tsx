import { useEffect, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/** Supplied Z-up volcanic terrain. Keep the original GLB and its PBR layers. */
export function Foreground({mobile}: {mobile: boolean}) {
  const {scene} = useGLTF('/assets/foreground_planet.glb');
  const maps=useTexture(['diffuse','normal','arm'].map(n=>`/assets/lunar/${n}${mobile?'-mobile':''}.webp`));
  maps[0].colorSpace=THREE.SRGBColorSpace;
  maps.forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,5);t.anisotropy=mobile?2:8;t.flipY=false;});
  const terrain = useMemo(() => {
    const copy=scene.clone(true);
    copy.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      o.receiveShadow=true;
      o.castShadow=true;
      const material=(o.material as THREE.MeshStandardMaterial).clone();
      material.color.set('#969ba2');
      material.map=maps[0];material.normalMap=maps[1];material.roughnessMap=maps[2];material.aoMap=maps[2];material.aoMapIntensity=.8;material.metalnessMap=null;
      material.normalScale.set(.85,.85);
      material.roughness=.96;
      if(material.map) material.map.anisotropy=mobile ? 2 : 8;
      o.material=material;
    });
    return copy;
  },[scene,mobile,maps]);
  useEffect(()=>()=>{terrain.traverse(o=>{if(o instanceof THREE.Mesh)(o.material as THREE.Material).dispose();});},[terrain]);
  return <group position={[0,mobile ? -4.65 : -3.38,3]}>
    <primitive object={terrain} rotation={[-Math.PI/2,0,0]} scale={[1.8,1.4,.68]}/>
  </group>;
}

/** Photographic plate in 3D world space: appropriate for the tiny camera arc.
 * A replacement detailed GLB can be mounted at the same seat transform later. */
export function SeatedBoy({mobile}: {mobile:boolean}) {
  const texture=useTexture('/assets/boy-cinematic.webp');
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  const size=mobile ? 1.68 : 1.62;
  return <group position={[0,mobile ? -4.61 : -3.34,3.12]}>
    <mesh position={[0,size*.47,.06]}>
      <planeGeometry args={[size,size]}/>
      <meshBasicMaterial map={texture} transparent alphaTest={.025} toneMapped={false} depthWrite={false}/>
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.013,0]} scale={[.7,.28,1]}>
      <circleGeometry args={[1,48]}/><meshBasicMaterial color="#010203" transparent opacity={.8} depthWrite={false}/>
    </mesh>
  </group>;
}
