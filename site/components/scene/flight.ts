import {MathUtils, Matrix4, Quaternion, Spherical, Vector3} from 'three';

/** Mutable animation state shared with the render loop. */
export type EarthFlight = {
  active: boolean;
  progress: number;
  direction: number;
};

/** Capture the live pose once; every sample moves inward from that same pose. */
export function createEarthFlight(position:Vector3, quaternion:Quaternion, center:Vector3, direction:number) {
  const origin=position.clone();
  const orientation=quaternion.clone();
  const start=new Spherical().setFromVector3(origin.clone().sub(center));
  const orbit=new Spherical();
  const matrix=new Matrix4();
  const facing=new Quaternion();
  const up=new Vector3(0,1,0);
  const finalRadius=Math.min(start.radius,2.72);
  return (progress:number, nextPosition:Vector3, nextQuaternion:Quaternion)=>{
    const p=MathUtils.clamp(progress,0,1);
    if(p===0){nextPosition.copy(origin);nextQuaternion.copy(orientation);return;}
    const travel=p*p*(3-2*p);
    orbit.set(
      start.radius*Math.pow(finalRadius/start.radius,travel),
      MathUtils.lerp(start.phi,Math.PI/2-.04,travel),
      start.theta+direction*.45*travel,
    );
    nextPosition.setFromSpherical(orbit).add(center);
    matrix.lookAt(nextPosition,center,up);
    facing.setFromRotationMatrix(matrix);
    // Preserve the complete viewing angle, including any live parallax, at
    // departure, gradually turning toward the landing point as we approach.
    nextQuaternion.copy(orientation).slerp(facing,travel);
  };
}
