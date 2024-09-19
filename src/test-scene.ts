import * as THREE from 'three'
import { initScene } from './render/render-setting'
import { setCameraControl } from './controler/camera-controls'
import { resizeRendererToDisplaySize } from './render/responsiveness'
import { addLights } from './light'

const CANVAS_ID = 'scene'
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(0,0,5)
const { cameraControls } = setCameraControl(camera, canvas)

addLights(scene)

//#region object 
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshStandardMaterial({color: 'red'})
)
scene.add(cube)
console.log(cube.position)
//#endregion

//#region animate
function animate() {
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  // 박스 회전
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();
//#endregion
