import * as THREE from 'three'

// 직육면체의 8개 꼭짓점 정의 (x, y, z 좌표)
const vertices = [
  -1, -1, -1,  // 0번 점
   1, -1, -1,  // 1번 점
   1,  1, -1,  // 2번 점
  -1,  1, -1,  // 3번 점
  -1, -1,  1,  // 4번 점
   1, -1,  1,  // 5번 점
   1,  1,  1,  // 6번 점
  -1,  1,  1   // 7번 점
];

// 각 점을 연결하는 선분 정의 (점의 인덱스)
const edges = [
  0, 1,  1, 2,  2, 3,  3, 0,  // 밑면
  4, 5,  5, 6,  6, 7,  7, 4,  // 윗면
  0, 4,  1, 5,  2, 6,  3, 7   // 옆면
];

export function drawBoundary(scene: THREE.Scene, position: THREE.Vector3, boxSize: number){
  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3))
  lineGeometry.setIndex(edges);

  const wireCube = new THREE.LineSegments(lineGeometry, 
    new THREE.MeshBasicMaterial({color: 'purple'}));
  
  wireCube.position.set(position.x, position.y, position.z);
  wireCube.scale.set(boxSize, boxSize, boxSize);
  scene.add(wireCube);
}
