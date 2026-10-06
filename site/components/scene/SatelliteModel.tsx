import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useThree,useFrame} from '@react-three/fiber';
import {SUN} from './Earth';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import * as THREE from 'three';

/** Reference-inspired communications satellite: foil, curved dish and cell arrays. */
export function SatelliteModel({sunlight}:{sunlight:RefObject<{value:number}>}){
  const arrays=useRef<THREE.Group>(null);
  const parentRotation=useMemo(()=>new THREE.Quaternion(),[]);
  const localSun=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(()=>{
    if(!arrays.current?.parent)return;
    arrays.current.parent.getWorldQuaternion(parentRotation);
    localSun.copy(SUN).applyQuaternion(parentRotation.invert());
    // A real single-axis hinge: the booms stay on the body's X axis.
    // Only panel pitch changes, so the wings can never swing through the bus.
    arrays.current.rotation.x=Math.atan2(-localSun.y,localSun.z);
  });
  const {gl}=useThree();
  const parts=useMemo(()=>{
    const room=new RoomEnvironment();
    const pmrem=new THREE.PMREMGenerator(gl);
    const reflection=pmrem.fromScene(room,.05);room.dispose();pmrem.dispose();
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#b3a58b';ctx.fillRect(0,0,512,512);
    for(let row=0;row<14;row++)for(let column=0;column<7;column++){
      const x=column*73+3,y=row*36.5+2;
      const gradient=ctx.createLinearGradient(x,y,x+70,y+34);
      gradient.addColorStop(0,'#152d60');gradient.addColorStop(.6,'#304783');gradient.addColorStop(1,'#524c91');
      ctx.fillStyle=gradient;ctx.fillRect(x,y,68,32);
      ctx.fillStyle='#9cacc477';ctx.fillRect(x+22,y,1,32);ctx.fillRect(x+44,y,1,32);
    }
    const cells=new THREE.CanvasTexture(canvas);cells.colorSpace=THREE.SRGBColorSpace;cells.anisotropy=4;
    const silver=new THREE.MeshStandardMaterial({color:'#b9c2c6',metalness:.9,roughness:.25,envMap:reflection.texture,envMapIntensity:.22});
    const gold=new THREE.MeshStandardMaterial({color:'#b7a982',metalness:.85,roughness:.36,envMap:reflection.texture,envMapIntensity:.18});
    const dark=new THREE.MeshStandardMaterial({color:'#1c252e',metalness:.6,roughness:.43,envMap:reflection.texture,envMapIntensity:.18});
    const panel=new THREE.MeshPhysicalMaterial({map:cells,metalness:.5,roughness:.31,clearcoat:.65,clearcoatRoughness:.25,envMap:reflection.texture,envMapIntensity:.2,side:THREE.DoubleSide});
    const dish=new THREE.LatheGeometry(Array.from({length:33},(_,i)=>{const r=i/32*.62;return new THREE.Vector2(r,r*r*.55);}),64);
    const dishMaterial=new THREE.MeshStandardMaterial({color:'#d8d7cf',metalness:.8,roughness:.3,envMap:reflection.texture,envMapIntensity:.2,side:THREE.DoubleSide});
    for(const material of [silver,gold,dark,panel,dishMaterial]){
      material.onBeforeCompile=shader=>{
        shader.uniforms.uSatelliteSunlight=sunlight.current;
        shader.fragmentShader='uniform float uSatelliteSunlight;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight *= mix(0.08, 1.0, uSatelliteSunlight);\n#include <opaque_fragment>');
      };
      material.customProgramCacheKey=()=> 'satellite-eclipse-v1';
    }
    return {silver,gold,dark,panel,cells,reflection,dish,dishMaterial};
  },[gl,sunlight]);
  useEffect(()=>()=>{parts.silver.dispose();parts.gold.dispose();parts.dark.dispose();parts.panel.dispose();parts.cells.dispose();parts.reflection.dispose();parts.dish.dispose();parts.dishMaterial.dispose();},[parts]);
  return <group>
    <mesh rotation={[Math.PI/2,0,0]} material={parts.gold}><cylinderGeometry args={[.38,.38,1.35,32]}/></mesh>
    <mesh position={[0,0,-.68]} rotation={[Math.PI/2,0,0]} material={parts.silver}><cylinderGeometry args={[.4,.4,.09,32]}/></mesh>
    <mesh position={[0,0,.66]} rotation={[Math.PI/2,0,0]} material={parts.silver}><cylinderGeometry args={[.4,.4,.12,32]}/></mesh>
    {Array.from({length:8},(_,i)=><group key={i} rotation={[0,0,i*Math.PI/4]}><mesh position={[.38,0,0]} material={parts.silver}><boxGeometry args={[.025,.025,1.26]}/></mesh><mesh position={[.385,0,.08]} material={parts.dark}><boxGeometry args={[.012,.13,.65]}/></mesh></group>)}
    <mesh position={[0,0,-.77]} rotation={[Math.PI/2,0,0]} material={parts.dark}><cylinderGeometry args={[.13,.2,.15,32]}/></mesh>
    <mesh position={[0,0,.79]} rotation={[Math.PI/2,0,0]} material={parts.silver}><cylinderGeometry args={[.13,.22,.22,32]}/></mesh>
    <mesh position={[0,0,.9]} rotation={[Math.PI/2,0,0]} geometry={parts.dish} material={parts.dishMaterial}/>
    <mesh position={[0,0,1.112]} material={parts.silver}><torusGeometry args={[.62,.012,8,64]}/></mesh>
    <mesh position={[0,0,1.39]} rotation={[Math.PI/2,0,0]} material={parts.gold}><cylinderGeometry args={[.045,.065,.15,16]}/></mesh>
    {[0,1,2].map(i=><group key={i} rotation={[0,0,i*Math.PI*2/3]}>
      <Strut from={[.55,0,1.066]} to={[0,0,1.39]} material={parts.silver}/>
    </group>)}
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.51,0,0]} rotation={[0,0,Math.PI/2]} material={parts.silver}><cylinderGeometry args={[.085,.085,.32,20]}/></mesh>
      <mesh position={[side*.7,0,0]} material={parts.dark}><boxGeometry args={[.22,.065,.065]}/></mesh>
    </group>)}
    <group ref={arrays}>{[-1,1].map(side=><group key={side}>
      <mesh position={[side*1.845,0,0]} material={parts.silver}><boxGeometry args={[.1,.1,.04]}/></mesh>
      
      {[1.32,2.37].map(x=><group key={x} position={[side*x,0,0]}>
        <mesh material={parts.gold}><boxGeometry args={[1.01,.91,.035]}/></mesh>
        <mesh position={[0,0,.021]} material={parts.panel}><planeGeometry args={[.95,.85]}/></mesh>
        <mesh position={[0,0,-.021]} rotation={[0,Math.PI,0]} material={parts.dark}><planeGeometry args={[.95,.85]}/></mesh>
        {[-.27,.27].map(y=><mesh key={y} position={[0,y,.026]} material={parts.silver}><boxGeometry args={[.96,.009,.012]}/></mesh>)}
      </group>)}
    </group>)}</group>
  </group>;
}

function Strut({from,to,material}:{from:[number,number,number];to:[number,number,number];material:THREE.Material}){
  const {midpoint,rotation,length}=useMemo(()=>{
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),direction=b.clone().sub(a);
    return {midpoint:a.add(b).multiplyScalar(.5),rotation:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize()),length:direction.length()};
  },[from,to]);
  return <mesh position={midpoint} quaternion={rotation} material={material}><cylinderGeometry args={[.012,.012,length,8]}/></mesh>;
}
