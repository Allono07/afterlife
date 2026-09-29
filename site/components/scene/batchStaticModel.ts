import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Collapse static, single-material parts into fewer draw calls without losing detail. */
export function batchStaticModel(source: THREE.Object3D) {
  const result = new THREE.Group();
  const buckets = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[] }>();
  source.updateMatrixWorld(true);
  source.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    if (Array.isArray(object.material)) {
      result.add(new THREE.Mesh(geometry, object.material));
      return;
    }
    const attributes = Object.keys(geometry.attributes).sort().map(name => {
      const attribute = geometry.attributes[name];
      return `${name}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}`;
    }).join('|');
    const key = `${object.material.uuid}:${Boolean(geometry.index)}:${attributes}`;
    const bucket = buckets.get(key) ?? {material: object.material, geometries: [] as THREE.BufferGeometry[]};
    bucket.geometries.push(geometry);
    buckets.set(key, bucket);
  });
  for (const {material, geometries} of buckets.values()) {
    const merged = mergeGeometries(geometries);
    if (merged) {
      result.add(new THREE.Mesh(merged, material));
      geometries.forEach(geometry => geometry.dispose());
    } else {
      geometries.forEach(geometry => result.add(new THREE.Mesh(geometry, material)));
    }
  }
  return result;
}
