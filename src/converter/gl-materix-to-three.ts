import { vec3 } from 'gl-matrix';
import * as THREE from 'three'

export function vec3ToVector3(vec: vec3): THREE.Vector3{
  return new THREE.Vector3(vec[0], vec[1], vec[2]);
}