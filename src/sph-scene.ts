import * as THREE from 'three'
import { initScene } from './render/render-setting'
import { setCameraControl } from './controler/camera-controls'
import { resizeRendererToDisplaySize } from './render/responsiveness'
import { addLights } from './light'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import vertexShader from './shader/vertexshader.glsl'
import fragmentShader from './shader/fragmentshader.glsl'
import computefragment from './shader/computefragment.glsl'
import { vec3 } from 'gl-matrix'

const CANVAS_ID = 'scene'
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(0,0,3)
const { cameraControls } = setCameraControl(camera, canvas)
addLights(scene)

//#region SPH variable - general
let showSpheres: boolean = true;
let numToSpawn: vec3 = [10,10,10];
let totalParticles: number = numToSpawn[0] * numToSpawn[1] * numToSpawn[2];
let spawnCenter: vec3 = [0,0,0];
let particleRadius: number = 0.1;
//#endregion

//#region SPH variable - particle rendering
let particleMesh: THREE.Mesh;
let particleRenderSize: number = 8;
let material: THREE.Material;
//#endregion

//#region SPH variable - compute

//#endregion

//#region object 
const pointmaterial = new THREE.ShaderMaterial({
  uniforms:{
    uTexture: {value: null},
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
})
const points = new THREE.Points(
  new THREE.PlaneGeometry(2, 2, 128, 128),
  pointmaterial
)
scene.add(points)
//#endregion

//#region gpu compute renderer
const gpuCompute = new GPUComputationRenderer(canvas.clientWidth,  canvas.clientHeight, renderer)
const dtPosition = gpuCompute.createTexture();
const positionVariable = gpuCompute.addVariable('uCurrentPosition', computefragment, dtPosition )
gpuCompute.setVariableDependencies(positionVariable, [positionVariable])
gpuCompute.init()
//#endregion

//#region animate
function animate() {
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  gpuCompute.compute();
  pointmaterial.uniforms.uTexture.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
  console.log(points.position)

  renderer.render(scene, camera);
}
animate();
//#endregion
