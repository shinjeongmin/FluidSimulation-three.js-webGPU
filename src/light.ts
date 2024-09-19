import * as THREE from 'three'
let ambientLight: THREE.AmbientLight
let directionalLight: THREE.DirectionalLight
let pointLight: THREE.PointLight

export function addLights(scene: THREE.Scene){
  ambientLight = new THREE.AmbientLight('#ffffff', 0.4)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight('white', 0.5)
  scene.add(directionalLight)
}