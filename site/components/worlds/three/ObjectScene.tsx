import {Suspense,useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import {IndiaMap} from './IndiaMap';
import {ValuesArtifact} from './ValuesArtifact';

function TerrainModel(){
  const {scene}=useGLTF('/assets/highland_landscape_fragment.glb');
  const object=useMemo(()=>{
    const copy=scene.clone(true);copy.rotation.x=-Math.PI/2;copy.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(copy);const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const factor=4.6/Math.max(size.x,size.y,size.z);
    copy.position.sub(center);const group=new THREE.Group();group.add(copy);group.scale.setScalar(factor);return group;
  },[scene]);
  return <primitive object={object}/>;
}
function Assembly({kind,turn,selected,reduced}:{kind:'terrain'|'sculpture'|'india';turn:number;selected:number;reduced:boolean}){
  const root=useRef<THREE.Group>(null);const {invalidate}=useThree();
  useEffect(()=>invalidate(),[turn,selected,invalidate]);
  useFrame((_,delta)=>{
    if(!root.current)return;
    const y=kind==='india'?THREE.MathUtils.clamp(turn,-.45,.45):turn+selected*.12;
    const target=y;
    root.current.rotation.y=THREE.MathUtils.damp(root.current.rotation.y,target,6,reduced?1:Math.min(delta,.05));
    if(Math.abs(root.current.rotation.y-target)>.0001)invalidate();
  });
  return <group ref={root} onPointerMove={()=>invalidate()} rotation={[kind==='india'?.18:0,0,0]}>
    {kind==='india'?<IndiaMap/>:kind==='sculpture'?<ValuesArtifact selected={selected}/>:<TerrainModel/>}
    {kind==='terrain'&&<group position={[0,.55,0]}>
      {Array.from({length:3},(_,i)=><group key={i} position={[(i-1)*.9,.2+(i===1?.2:0),0]}><mesh rotation={[0,.3,0]}><boxGeometry args={[.52,.65,.12]}/><meshStandardMaterial color={i===selected%3?'#94b29c':'#e9e9dc'} metalness={.2} roughness={.45}/></mesh><mesh position={[0,0,.07]}><planeGeometry args={[.34,.035]}/><meshStandardMaterial color="#476558"/></mesh></group>)}
    </group>}
  </group>;
}
function FitMap(){
  const {camera,size,invalidate}=useThree();
  useEffect(()=>{
    camera.position.setZ(Math.max(8.1,3.05/(Math.tan(21*Math.PI/180)*(size.width/size.height))));
    camera.updateProjectionMatrix();invalidate();
  },[camera,size.width,size.height,invalidate]);
  return null;
}
export default function ObjectScene(props:{kind:'terrain'|'sculpture'|'india';turn:number;selected:number;reduced:boolean}){
  const india=props.kind==='india';
  return <Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:india?[0,-.15,8.7]:[0,1.8,7],fov:42}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} resize={{scroll:false}} fallback={<span>Explore the details below.</span>}>
    {india&&<FitMap/>}<ambientLight intensity={india?.85:.65}/><directionalLight position={[-4,6,5]} intensity={india?1.2:2.3} color="#fff3da"/><directionalLight position={[4,2,-2]} intensity={.8} color="#b6d1dc"/>
    <Suspense fallback={null}><Assembly {...props}/></Suspense>
  </Canvas>;
}
