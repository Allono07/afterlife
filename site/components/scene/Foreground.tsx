import { useEffect, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/** Supplied Z-up volcanic terrain. Keep the original GLB and its PBR layers. */
export function Foreground({mobile}: {mobile: boolean}) {
  const {scene} = useGLTF('/assets/foreground_planet.glb');
  const loadedMaps=useTexture([`albedo`,`normal`,`arm`].map(n=>`/assets/lunar/${n}${mobile && n!=='albedo'?'-mobile':''}.webp`));
  const maps=useMemo(()=>loadedMaps.map((source,index)=>{
    const texture=source.clone();
    if(index===0)texture.colorSpace=THREE.SRGBColorSpace;
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(5,5);
    texture.anisotropy=8;
    texture.flipY=false;
    return texture;
  }) as [THREE.Texture,THREE.Texture,THREE.Texture],[loadedMaps]);
  const terrain = useMemo(() => {
    const copy=scene.clone(true);
    copy.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      o.geometry=o.geometry.clone();
      if(o.name==='ForegroundSurface') {
        const positions=o.geometry.attributes.position;
        for(let i=0;i<positions.count;i++) {
          const x=positions.getX(i), y=positions.getY(i), oldZ=positions.getZ(i);
          const micro=Math.max(-.11,Math.min(.11,(oldZ+1.7)*.055));
          // Compress the foreground depth into a shallow lunar horizon and
          // lift its center so the silhouette reads as a curved planet edge.
          positions.setZ(i,-.02-(x*x)/135-(y*y)/800+micro);
        }
        positions.needsUpdate=true;
        const index=o.geometry.index;
        if(index) for(let i=0;i<index.count;i+=3) {
          const b=index.getX(i+1),c=index.getX(i+2);index.setX(i+1,c);index.setX(i+2,b);
        }
        if(index)index.needsUpdate=true;
      }
      const rocky=o.name.startsWith('Rock_') || o.name.startsWith('FracturePlate_');
      if(rocky) {
        if(mobile) {
          // The original rock scatter sits too far out along the wide desktop horizon.
          // Pull it inward on phones while leaving the lunar surface itself full-width.
          o.geometry.computeBoundingBox();
          const bounds=o.geometry.boundingBox;
          const positions=o.geometry.attributes.position;
          if(bounds) {
            const centerX=(bounds.min.x+bounds.max.x)/2;
            const offsetX=centerX*(.32-1);
            for(let i=0;i<positions.count;i++) positions.setX(i,positions.getX(i)+offsetX);
            positions.needsUpdate=true;
          }
        }
        o.geometry.translate(0,0,.4);
      }
      o.geometry.computeVertexNormals();
      o.receiveShadow=true;
      o.castShadow=true;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      const tuned=materials.map(source=>{
        const material=(source as THREE.MeshStandardMaterial).clone();
        material.color.set('#cfcbc3');
        material.roughness=.96;
        if(o.name==='ForegroundSurface' || rocky) {
          material.map=maps[0];material.normalMap=maps[1];material.roughnessMap=maps[2];material.aoMap=maps[2];material.aoMapIntensity=.8;material.metalnessMap=null;
          material.normalScale.set(rocky?1.35:2.35,rocky?1.35:2.35);
        }
        if(material.map)material.map.anisotropy=8;
        return material;
      });
      o.material=Array.isArray(o.material)?tuned:tuned[0];
    });
    return copy;
  },[scene,mobile,maps]);
  useEffect(()=>()=>{
    terrain.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const material of Array.isArray(o.material)?o.material:[o.material])material.dispose();}});
    maps.forEach(texture=>texture.dispose());
  },[terrain,maps]);
  return <group position={[0,mobile ? -6.3 : -3.38,mobile ? 5.9 : 3]}>
    <primitive object={terrain} rotation={[-Math.PI/2,0,0]} scale={[1.8,mobile?.62:.24,.68]}/>
  </group>;
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
    <mesh position={[0,size*.47,.06]}>
      <planeGeometry args={[size,size]}/>
      <meshBasicMaterial map={texture} transparent alphaTest={.025} toneMapped={false} depthWrite={false}/>
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.095,0]} scale={[.7,.28,1]}>
      <circleGeometry args={[1,48]}/><meshBasicMaterial color="#010203" transparent opacity={.8} depthWrite={false}/>
    </mesh>
  </group>;
}
