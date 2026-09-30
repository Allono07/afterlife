import assert from 'node:assert/strict';
import test from 'node:test';
import {PerspectiveCamera,Quaternion,Vector3} from 'three';
import {createEarthFlight} from '../components/scene/flight.ts';

for(const mobile of [false,true]){
  for(const direction of [-1,1]){
    test(`Continuous ${mobile?'mobile':'desktop'} flight, direction ${direction}`,()=>{
      const center=new Vector3(0,mobile?-1.62:-.75,0);
      const camera=new PerspectiveCamera(42,1,.1,150);
      camera.position.set(.057,.36,mobile?13.5:7.3);
      camera.lookAt(new Vector3(0,mobile?-.65:-.05,0));
      camera.rotateZ(.013);
      const initialPosition=camera.position.clone();
      const initialOrientation=camera.quaternion.clone();
      const sample=createEarthFlight(camera.position,camera.quaternion,center,direction);
      const position=new Vector3();
      const orientation=new Quaternion();
      sample(0,position,orientation);
      assert.deepEqual(position.toArray(),initialPosition.toArray(),'departure must preserve the exact camera position');
      assert.deepEqual(orientation.toArray(),initialOrientation.toArray(),'departure must preserve the complete orientation');
      let distance=position.distanceTo(center);
      for(let frame=1;frame<=240;frame++){
        sample(frame/240,position,orientation);
        const nextDistance=position.distanceTo(center);
        assert.ok(nextDistance<=distance+1e-10,'the camera must never pull back');
        assert.ok(nextDistance>=2.72-1e-10,'the camera must remain outside Earth');
        assert.ok(Math.abs(orientation.length()-1)<1e-10);
        if(frame===1)assert.ok(orientation.angleTo(initialOrientation)<.001,'orientation must not snap on entry');
        distance=nextDistance;
      }
      assert.ok(Math.abs(distance-2.72)<1e-10);
      assert.deepEqual(camera.position.toArray(),initialPosition.toArray(),'path sampling must not mutate the captured pose');
    });
  }
}
