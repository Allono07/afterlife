import {useEffect,useMemo} from 'react';
import {Html,useTexture} from '@react-three/drei';
import * as THREE from 'three';
import india from '../../maps/india.json';
const scale=.19,correction=Math.cos(22*Math.PI/180);
export const projectLocation=(longitude:number,latitude:number)=>new THREE.Vector3((longitude-82)*scale*correction,(latitude-22)*scale,.18);
export function IndiaMap(){
  const textures=useTexture(['/assets/earth-v2/day.webp','/assets/earth-v2/night.webp']);
  const maps=useMemo(()=>textures.map(source=>{const copy=source.clone();copy.colorSpace=THREE.SRGBColorSpace;copy.anisotropy=4;return copy;}),[textures]);
  const geometries=useMemo(()=>india.coordinates.map(polygon=>{
    const shape=new THREE.Shape();
    polygon[0].forEach(([lon,lat],i)=>{const p=projectLocation(lon,lat);if(i===0)shape.moveTo(p.x,p.y);else shape.lineTo(p.x,p.y);});
    polygon.slice(1).forEach(ring=>{const path=new THREE.Path();ring.forEach(([lon,lat],i)=>{const p=projectLocation(lon,lat);if(i===0)path.moveTo(p.x,p.y);else path.lineTo(p.x,p.y);});shape.holes.push(path);});
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:false});
    const positions=geometry.attributes.position,uv=geometry.attributes.uv;
    for(let i=0;i<positions.count;i++)uv.setXY(i,(positions.getX(i)/(scale*correction)+82+180)/360,(positions.getY(i)/scale+22+90)/180);
    return geometry;
  }),[]);
  useEffect(()=>()=>{geometries.forEach(g=>g.dispose());maps.forEach(t=>t.dispose());},[geometries,maps]);
  const location=projectLocation(77.5946,12.9716);
  return <group>
    {geometries.map((geometry,i)=><mesh key={i} geometry={geometry}><meshStandardMaterial map={maps[0]} color="#658795" emissiveMap={maps[1]} emissive="#ffd18a" emissiveIntensity={3.1} roughness={.78} metalness={.12}/></mesh>)}
    <group position={location}>
      <mesh position={[0,0,.22]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.025,.025,.4,12]}/><meshBasicMaterial color="#ecd5a4"/></mesh>
      <mesh position={[0,0,.43]}><sphereGeometry args={[.115,24,16]}/><meshBasicMaterial color="#ffde9a"/></mesh>
      <mesh><ringGeometry args={[.18,.22,48]}/><meshBasicMaterial color="#ffde9a" side={THREE.DoubleSide}/></mesh>
      <Html position={[.26,.08,.43]} center={false} zIndexRange={[5,0]}><span className="map-pin-label">Bengaluru<span>Karnataka, IN</span></span></Html>
    </group>
  </group>;
}
