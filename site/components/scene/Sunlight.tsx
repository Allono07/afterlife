import { useMemo } from 'react';
import * as THREE from 'three';

/** A restrained optical shaft behind Earth, rather than fog filling empty space. */
export function Sunlight({mobile}: {mobile:boolean}) {
  const uniforms=useMemo(()=>({earthY:{value:mobile?-1.62:-.75}}),[mobile]);
  return <mesh position={[0,0,-3.5]}>
    <planeGeometry args={[26,22]}/>
    <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
      uniforms={uniforms}
      vertexShader={`varying vec2 uvRay;
        void main(){uvRay=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`varying vec2 uvRay; uniform float earthY;
        void main(){
          vec2 p=(uvRay-.5)*vec2(26.,22.);
          vec2 source=vec2(-9.,9.);
          vec2 axis=normalize(vec2(0.,earthY)-source);
          vec2 ray=p-source;
          float along=dot(ray,axis);
          float across=dot(ray,vec2(-axis.y,axis.x));
          float spread=.3+max(along,0.)*.075;
          float broad=exp(-pow(across/(spread*2.5),2.))*.018;
          float shafts=exp(-pow((across-spread*.55)/(spread*.24),2.))*.035
            +exp(-pow((across+spread*.7)/(spread*.32),2.))*.022;
          float fade=smoothstep(0.,2.,along)*(1.-smoothstep(10.,16.,along));
          gl_FragColor=vec4(vec3(1.,.88,.66),(broad+shafts)*fade);
        }`}/>
  </mesh>;
}
