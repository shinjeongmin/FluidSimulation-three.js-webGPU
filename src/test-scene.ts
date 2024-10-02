import * as THREE from 'three'
import { initScene } from './render/render-setting'
import { setCameraControl } from './controler/camera-controls'
import { resizeRendererToDisplaySize } from './render/responsiveness'
import { addLights } from './light'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import vertexShader from './shader/test/vertexshader.glsl'
import fragmentShader from './shader/test/fragmentshader.glsl'
import computefragment from './shader/test/computefragment.glsl'

const CANVAS_ID = 'scene'
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(0,0,3)
const { cameraControls } = setCameraControl(camera, canvas)
addLights(scene)

//#region object 
const material = new THREE.ShaderMaterial({
  uniforms:{
    uTexture: {value: null},
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
})
const points = new THREE.Points(
  new THREE.PlaneGeometry(2, 2, 128, 128),
  material
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
  material.uniforms.uTexture.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
  console.log(points.position)

  renderer.render(scene, camera);
}
animate();
//#endregion
