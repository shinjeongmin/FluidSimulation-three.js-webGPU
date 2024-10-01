import { vec3 } from 'gl-matrix';
import * as THREE from 'three'

class Particle{
  pressure: number;
  density: number;
  currentForce: vec3;
  velocity: vec3;
  position: vec3;
}