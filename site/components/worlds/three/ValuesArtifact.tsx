import {useEffect,useMemo} from 'react';
import * as THREE from 'three';

const stones=[
  {y:-1.16,x:0,scale:[1.18,.29,.74],angle:-.05},
  {y:-.46,x:.13,scale:[1.02,.27,.7],angle:.12},
  {y:.18,x:-.06,scale:[.88,.26,.66],angle:-.09},
  {y:.78,x:.08,scale:[.7,.25,.57],angle:.14},
] as const;

/** Four tactile stones: a quiet visual counterpart to the four principles. */
export function ValuesArtifact({selected}:{selected:number}){
  const geometry=useMemo(()=>{
    const result=new THREE.IcosahedronGeometry(1,3);
    const position=result.attributes.position;
    for(let i=0;i<position.count;i++){
      const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
      const grain=1+.038*Math.sin(x*11+z*7)*Math.sin(y*8-z*5)+.018*Math.cos(x*19+y*13);
      position.setXYZ(i,x*grain,y*grain,z*grain);
    }
    result.computeVertexNormals();
    return result;
  },[]);
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const context=canvas.getContext('2d')!;
    const image=context.createImageData(256,256);
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const grain=(Math.sin(x*.15+y*.09)*11+Math.cos(x*.037-y*.12)*14+Math.sin(x*.64+y*.44)*6);
      const value=Math.max(0,Math.min(255,145+grain));
      const offset=(y*256+x)*4;
      image.data[offset]=image.data[offset+1]=image.data[offset+2]=value;
      image.data[offset+3]=255;
    }
    context.putImageData(image,0,0);
    const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;
    return map;
  },[]);
  useEffect(()=>()=>{geometry.dispose();texture.dispose();},[geometry,texture]);
  return <group position={[0,-.05,0]} scale={1.42}>
    <mesh position={[0,-1.52,-.17]} rotation={[-Math.PI/2,0,0]}>
      <circleGeometry args={[1.7,48]}/>
      <meshBasicMaterial color="#071612" transparent opacity={.35} depthWrite={false}/>
    </mesh>
    {stones.map((stone,i)=><mesh key={i} geometry={geometry}
      position={[stone.x+(selected===i?.12:0),stone.y,0]}
      rotation={[.05,i*.38,stone.angle]}
      scale={[stone.scale[0],stone.scale[1],stone.scale[2]]}>
      <meshStandardMaterial color={selected===i?'#729675':'#ddd8c4'} roughness={.76} metalness={0} bumpMap={texture} bumpScale={.08}/>
    </mesh>)}
    <mesh position={[0,-1.62,0]}>
      <cylinderGeometry args={[1.12,1.22,.1,48]}/>
      <meshStandardMaterial color="#a3936e" metalness={.42} roughness={.48}/>
    </mesh>
  </group>;
}
