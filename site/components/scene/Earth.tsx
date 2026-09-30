import { type RefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { EarthFlight } from './flight';

export const SUN=new THREE.Vector3(-5,6,3).normalize();
// A modestly smaller globe opens more negative space above the lunar horizon
// while keeping Earth's upper limb near the same hero composition.
const RADIUS=2.55;
const ROTATION=6.2;

const surfaceShader: THREE.MeshStandardMaterial['onBeforeCompile'] = shader => {
  shader.uniforms.uSun={value:SUN};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vEarthNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEarthNormal = normalize(mat3(modelMatrix) * objectNormal);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uSun;\nvarying vec3 vEarthNormal;').replace('#include <map_fragment>', `
    #include <map_fragment>
    float land=smoothstep(0.0,0.06,diffuseColor.g-diffuseColor.b*0.85);
    float ice=smoothstep(0.5,0.8,min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)));
    float sunDot=dot(normalize(vEarthNormal),normalize(uSun));
    float sunrise=smoothstep(-.12,.06,sunDot)*(1.0-smoothstep(.06,.32,sunDot));
    diffuseColor.rgb*=mix(vec3(1.0),vec3(.87,1.12,.88),land*(1.0-ice)*.55);
    diffuseColor.rgb*=mix(vec3(1.0),vec3(1.08,.78,.58),sunrise*.42);
  `).replace('#include <emissivemap_fragment>', `
    #include <emissivemap_fragment>
    float night=1.0-smoothstep(-.2,.18,dot(normalize(vEarthNormal),uSun));
    totalEmissiveRadiance*=night;
  `);
};

function Atmosphere() {
  const material=useMemo(()=>new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide,
    uniforms:{uSun:{value:SUN}},
    vertexShader:`varying vec3 vNormal; varying vec3 vPosition;
      void main(){vec4 world=modelMatrix*vec4(position,1.);vPosition=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`uniform vec3 uSun;varying vec3 vNormal;varying vec3 vPosition;
      void main(){vec3 N=normalize(vNormal);vec3 V=normalize(cameraPosition-vPosition);
      float edge=pow(1.-max(dot(N,V),0.),3.8);
      float sunDot=dot(N,normalize(uSun));
      float daylight=smoothstep(-.4,.8,sunDot);
      vec3 color=mix(vec3(.025,.17,.28),vec3(.25,.65,1.),daylight);
      float sunrise=smoothstep(-.35,-.08,sunDot)*(1.-smoothstep(-.08,.32,sunDot));
      color=mix(color,vec3(1.,.36,.16),sunrise*.38);
      float sunRim=pow(max(sunDot,0.),4.)*edge;
      color+=vec3(1.,.83,.55)*sunRim*.65;
      gl_FragColor=vec4(color,edge*(.10+daylight*.9));}`
  }),[]);
  return <mesh material={material}><sphereGeometry args={[RADIUS*1.012,96,64]}/></mesh>;
}

export function Earth({moving,mobile,flight}:{moving:boolean;mobile:boolean;flight:RefObject<EarthFlight>}) {
  const surface=useRef<THREE.Mesh>(null), clouds=useRef<THREE.Mesh>(null);
  const loadedTextures=useTexture(['day','clouds','night'].map(n=>`/assets/earth-v2/${n}${mobile && n!=='day'?'-mobile':''}.webp`));
  const [day,cloud,night]=useMemo(()=>loadedTextures.map((source,index)=>{
    const texture=source.clone();
    if(index!==1)texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=8;
    return texture;
  }) as [THREE.Texture,THREE.Texture,THREE.Texture],[loadedTextures]);
  useEffect(()=>()=>{day.dispose();cloud.dispose();night.dispose();},[day,cloud,night]);
  useFrame((_,delta)=>{
    if(!moving && !flight.current.active)return;
    const step=Math.min(delta,.05);
    const base=mobile?3:1;
    // Add speed to the existing rotations; never replace their live angles.
    const acceleration=flight.current.active?.55*Math.pow(Math.sin(flight.current.progress*Math.PI/2),2):0;
    if(surface.current)surface.current.rotation.y+=step*(base*.019+acceleration);
    if(clouds.current)clouds.current.rotation.y+=step*(base*.024+acceleration);
  });
  return <group position={[0,mobile ? -1.62 : -.75,0]} rotation={[.16,0,.12]}>
    <mesh ref={surface} rotation={[0,ROTATION,0]}>
      <sphereGeometry args={[RADIUS,mobile?112:144,mobile?72:96]}/>
      <meshStandardMaterial onBeforeCompile={surfaceShader} map={day} emissiveMap={night} emissive="#e6cda5" emissiveIntensity={.7} roughness={.8} metalness={.05}/>
    </mesh>
    <mesh ref={clouds} rotation={[0,ROTATION+.025,0]}>
      <sphereGeometry args={[RADIUS*1.004,mobile?112:144,mobile?72:96]}/>
      <meshStandardMaterial color="#f6fafc" alphaMap={cloud} transparent opacity={.84} depthWrite={false} roughness={1}/>
    </mesh>
    <Atmosphere/>
  </group>;
}
