import * as THREE from 'three'
import { initScene } from './render/render-setting'
import { setCameraControl } from './controler/camera-controls'
import { resizeRendererToDisplaySize } from './render/responsiveness'
import { addLights } from './light'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import vertexShader from './shader/test/vertexshader.glsl'
import fragmentShader from './shader/test/fragmentshader.glsl'
import computefragment from './shader/test/computefragment.glsl'
import { vec3 } from 'gl-matrix'
import { Particle } from './particle'
import * as glmatToThree from './converter/gl-materix-to-three'
import * as drawDebugLine from './draw-debug-line'
import * as debugGui from './gui/debug-gui'
import {SPH as _SPH} from './sph'

const CANVAS_ID = 'scene'
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(0,0,10)
const { cameraControls } = setCameraControl(camera, canvas)
addLights(scene)

const SPH = new _SPH(canvas, renderer);
SPH.setShader(computefragment);

function initialize(){
  // 파티클 인스턴스 생성
  SPH.particleMesh.geometry = new THREE.SphereGeometry(SPH.particleRadius);
  SPH.particleMesh.material = new THREE.MeshPhongMaterial({color: 'blue'});
  SPH.particleMesh = new THREE.InstancedMesh(SPH.particleMesh.geometry, SPH.particleMesh.material, 
    1000);
  scene.add(SPH.particleMesh)

  spawnParticlesInBox(SPH.particleMesh as THREE.InstancedMesh, SPH.numToSpawn,
    SPH.spawnCenter, SPH.particleRadius, 0)
}

function spawnParticlesInBox(
  particleMesh: THREE.InstancedMesh,
  numToSpawn: THREE.Vector3,  // x, y, z로 몇 개씩 스폰할지 설정
  spawnCenter: THREE.Vector3, // 스폰할 박스의 중심
  particleRadius: number,     // 입자간 거리
  spawnJitter: number         // 입자가 얼마나 엇나가도록 할지 설정 (jitter)
) {
  let index = 0;

  for (let x = 0; x < numToSpawn.x; x++) {
      for (let y = 0; y < numToSpawn.y; y++) {
          for (let z = 0; z < numToSpawn.z; z++) {
              // 입자의 위치 계산
              const spawnPos = new THREE.Vector3(
                  spawnCenter.x + x * particleRadius * 2,
                  spawnCenter.y + y * particleRadius * 2,
                  spawnCenter.z + z * particleRadius * 2
              );

              // Jitter 적용 (무작위로 약간 엇나가게 설정)
              const jitter = new THREE.Vector3(
                  (Math.random() - 0.5) * 2 * particleRadius * spawnJitter,
                  (Math.random() - 0.5) * 2 * particleRadius * spawnJitter,
                  (Math.random() - 0.5) * 2 * particleRadius * spawnJitter
              );

              spawnPos.add(jitter); // Jitter를 스폰 위치에 추가

              // 각 인스턴스의 변환 행렬 설정
              const matrix = new THREE.Matrix4();
              matrix.setPosition(spawnPos);

              // InstancedMesh에 행렬 적용
              particleMesh.setMatrixAt(index, matrix);
              index++;
          }
      }
  }

  // InstancedMesh를 업데이트하여 변경 사항을 반영
  particleMesh.instanceMatrix.needsUpdate = true;
}

//#region animate
function animate() {
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  SPH.gpuCompute.compute();

  renderer.render(scene, camera);
}
//#endregion

//#region function main stream
initialize();
debugGui.init();
debugGui.setShowSphere('showSpheres', SPH.showSpheres, SPH);
drawDebugLine.drawBoundary(scene, new THREE.Vector3(0,0,0), 1);
animate();
//#endregion
