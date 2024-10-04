import * as THREE from 'three'

// 렌더 타겟에서 텍스처를 읽는 함수
export function readTextureData(renderer: THREE.WebGLRenderer, renderTarget: THREE.WebGLRenderTarget):Float32Array {
  const width = renderTarget.width;
  const height = renderTarget.height;
  const size = width * height * 4; // RGBA 4채널
  const pixelBuffer = new Float32Array(size); // 텍스처 데이터를 저장할 배열

  // WebGLRenderer를 사용해 렌더 타겟의 픽셀 데이터를 읽어오기
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer);

  // 픽셀 데이터 콘솔 출력 (RGBA 값)
  console.log(pixelBuffer);

  return pixelBuffer;
}
// how to use
// readTextureData(renderer, gpuCompute.getCurrentRenderTarget(positionVariable));

// 렌더 타겟에서 텍스처를 가져오는 함수
export function getTextureData(renderer: THREE.WebGLRenderer, renderTarget: THREE.WebGLRenderTarget):Float32Array {
  const width = renderTarget.width;
  const height = renderTarget.height;
  const size = width * height * 4; // RGBA 4채널
  const pixelBuffer = new Float32Array(size); // 텍스처 데이터를 저장할 배열

  // WebGLRenderer를 사용해 렌더 타겟의 픽셀 데이터를 읽어오기
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer);

  return pixelBuffer;
}