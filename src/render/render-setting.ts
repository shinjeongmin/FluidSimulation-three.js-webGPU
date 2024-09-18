import { PCFSoftShadowMap, Scene, WebGLRenderer } from "three"

export function initScene(canvas_id : string): {scene:Scene, canvas:HTMLElement, renderer:WebGLRenderer}{
  const canvas: HTMLElement = document.querySelector(`canvas#${canvas_id}`)!
  const renderer: WebGLRenderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  const scene: Scene = new Scene()
  return {scene, canvas, renderer};
}