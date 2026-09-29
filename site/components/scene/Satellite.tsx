import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { batchStaticModel } from './batchStaticModel';

export function Satellite({moving, mobile}: {moving: boolean; mobile:boolean}) {
  const {scene} = useGLTF('/assets/satellite.glb');
  const model = useMemo(() => {
    const copy=scene.clone(true);
    const materialCache=new Map<THREE.Material,THREE.Material>();
    copy.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return;
      o.geometry=o.geometry.clone();
      o.geometry.computeVertexNormals();
      const tune=(source:THREE.Material)=>{
        const cached=materialCache.get(source);
        if(cached)return cached;
        const material=source.clone();
        materialCache.set(source,material);
        if(material instanceof THREE.MeshStandardMaterial){
          material.envMapIntensity=1.15;
          if(material.name==='Photovoltaic Array'){
            material.color.set('#c2d2dc');
            material.metalness=.08;
            material.roughness=.42;
            material.side=THREE.DoubleSide;
            material.emissive.set('#21394d');
            material.emissiveIntensity=.42;
          } else if(material.name==='Brushed Titanium') {
            material.color.set('#abb4bb');
            material.metalness=.68;
            material.roughness=.34;
          } else if(material.name==='Dark Titanium' || material.name==='Dark Aluminium') {
            material.metalness=.62;
            material.roughness=.36;
          } else if(material.name==='White Ceramic Coating' || material.name==='Structural White') {
            material.roughness=.4;
          }
        }
        return material;
      };
      o.material=Array.isArray(o.material)?o.material.map(tune):tune(o.material);
    });
    if(!mobile)return copy;
    const batched=batchStaticModel(copy);
    copy.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});
    return batched;
  },[scene,mobile]);
  useEffect(()=>()=>{
    model.traverse(o=>{
      if(o instanceof THREE.Mesh){
        o.geometry.dispose();
        for(const material of Array.isArray(o.material)?o.material:[o.material])material.dispose();
      }
    });
  },[model]);
  const orbit = useRef<THREE.Group>(null);
  const angle = useRef(.06);
  useFrame((_,delta) => {
    if (moving) angle.current += Math.min(delta,.05)*.06*(mobile?3:1);
    if (!orbit.current) return;
    const a=angle.current;
    const centerY=mobile ? -1.62 : -.75;
    orbit.current.position.set((mobile ? 3.4 : 4.1)*Math.cos(a), centerY+1.1*Math.sin(a), 2.6*Math.sin(a));
    orbit.current.rotation.set(.38, -.4-a, -.25);
  });
  return <group><group ref={orbit} position={[mobile ? 3.4 : 4.1,mobile ? -1.62 : -.68,.16]}><primitive object={model} scale={mobile ? .26 : .34} rotation={[-Math.PI/4,0,0]}/></group></group>;
}
