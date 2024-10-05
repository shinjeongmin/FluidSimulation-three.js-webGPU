import * as THREE from 'three'
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { Particle } from './particle';
import computeForce from './shader/density-pressure/compute-force.glsl'
import computeIntegratePosition from './shader/integrate/integrate-position.glsl'
import computeIntegrateVelocity from './shader/integrate/integrate-velocity.glsl'
import computeDensityPressure from './shader/density-pressure/density-pressure.glsl'

export class SPH{
  //#region SPH variable - general
  public showSpheres: boolean = true;
  public numToSpawn: THREE.Vector3 = new THREE.Vector3(10, 10, 10);
  public totalParticles: number = this.numToSpawn.x * this.numToSpawn.y * this.numToSpawn.z;
  public spawnCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public particleRadius: number = 0.1;

  public boxSize: THREE.Vector3 = new THREE.Vector3(5,5,5);
  //#endregion

  //#region SPH variable - particle rendering
  public particleMesh: THREE.Mesh;
  public particleRenderSize: number = 8;
  public material: THREE.Material;
  //#endregion

  //#region SPH variable - compute
  public gpuCompute: GPUComputationRenderer;
  public textureData: THREE.DataTexture;
  public textureVariable: Variable;
  public particles: Particle[];

  public initialPosition: THREE.Texture;
  public positionVariable: Variable;
  public initialVelocity: THREE.Texture;
  public velocityVariable: Variable;
  public initialForce: THREE.Texture;
  public forceVariable: Variable;
  public initialDenstPress: THREE.Texture;
  public denstPressVariable: Variable;
  //#endregion

  //#region SPH variable - compute
  // const gpuCompute = new GPUComputationRenderer(canvas.clientWidth,  canvas.clientHeight, renderer)
  // const dtPosition = gpuCompute.createTexture();
  // const positionVariable = gpuCompute.addVariable('uCurrentPosition', computefragment, dtPosition )
  // gpuCompute.setVariableDependencies(positionVariable, [positionVariable])
  // gpuCompute.init()
  // let particles: Particle[];
  //#endregion

  //#region SPH variable - fluid constants
  public boundDamping: number = -0.3;
  public viscosity: number = -0.003;
  public particleMass: number = 1;
  public gasConstant: number = 2;
  public restingDensity: number = 1;
  public timestep: number = 0.01;
  //#endregion

  constructor(private canvas: HTMLElement, private renderer: THREE.WebGLRenderer) {
    this.particleMesh = new THREE.Mesh();

    // this.gpuCompute = new GPUComputationRenderer(this.canvas.clientWidth, this.canvas.clientHeight, this.renderer);
    this.gpuCompute = new GPUComputationRenderer(this.totalParticles, 1, this.renderer);
  }

  public setShowSpheres(value: boolean){
    this.showSpheres = value
    if(this.showSpheres)
      this.particleMesh.visible = true;
    else
      this.particleMesh.visible = false;
  }
  public setShader(){
    this.initialPosition = this.gpuCompute.createTexture();
    this.initialVelocity = this.gpuCompute.createTexture();
    this.initialForce = this.gpuCompute.createTexture();
    this.initParticlePosition();
    this.initialDenstPress = this.gpuCompute.createTexture();

    this.positionVariable = this.gpuCompute.addVariable('positionTexture', computeIntegratePosition, this.initialPosition);
    this.velocityVariable = this.gpuCompute.addVariable('velocityTexture', computeIntegrateVelocity, this.initialVelocity);
    this.forceVariable = this.gpuCompute.addVariable('forceTexture', computeForce, this.initialForce);
    this.denstPressVariable = this.gpuCompute.addVariable('densityPressureTexture', computeDensityPressure, this.initialDenstPress);
    
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable, this.forceVariable]);
    this.gpuCompute.setVariableDependencies(this.forceVariable, [this.positionVariable, this.velocityVariable, this.forceVariable, this.denstPressVariable]);
    this.gpuCompute.setVariableDependencies(this.denstPressVariable, [this.positionVariable]);

    //#region position uniform
    this.positionVariable.material.uniforms.particleLength = { value: this.totalParticles };
    this.positionVariable.material.uniforms.particleMass = { value: this.particleMass };
    this.positionVariable.material.uniforms.viscosity = { value: this.viscosity };
    this.positionVariable.material.uniforms.gasConstant = { value: this.gasConstant };
    this.positionVariable.material.uniforms.restDensity = { value: this.restingDensity };
    this.positionVariable.material.uniforms.boundDamping = { value: this.boundDamping };
    this.positionVariable.material.uniforms.pi = { value: Math.PI };
    this.positionVariable.material.uniforms.boxSize = { value: this.boxSize };

    this.positionVariable.material.uniforms.radius = { value: this.particleRadius };
    this.positionVariable.material.uniforms.radius2 = { value: Math.pow(this.particleRadius, 2) };
    this.positionVariable.material.uniforms.radius3 = { value: Math.pow(this.particleRadius, 3) };
    this.positionVariable.material.uniforms.radius4 = { value: Math.pow(this.particleRadius, 4) };
    this.positionVariable.material.uniforms.radius5 = { value: Math.pow(this.particleRadius, 5) };
    
    this.positionVariable.material.uniforms.timestep = { value: this.timestep };
    //#endregion

    //#region velocity uniform
    this.velocityVariable.material.uniforms.particleLength = { value: this.totalParticles };
    this.velocityVariable.material.uniforms.particleMass = { value: this.particleMass };
    this.velocityVariable.material.uniforms.viscosity = { value: this.viscosity };
    this.velocityVariable.material.uniforms.gasConstant = { value: this.gasConstant };
    this.velocityVariable.material.uniforms.restDensity = { value: this.restingDensity };
    this.velocityVariable.material.uniforms.boundDamping = { value: this.boundDamping };
    this.velocityVariable.material.uniforms.pi = { value: Math.PI };
    this.velocityVariable.material.uniforms.boxSize = { value: this.boxSize };
    
    this.velocityVariable.material.uniforms.radius = { value: this.particleRadius };
    this.velocityVariable.material.uniforms.radius2 = { value: Math.pow(this.particleRadius, 2) };
    this.velocityVariable.material.uniforms.radius3 = { value: Math.pow(this.particleRadius, 3) };
    this.velocityVariable.material.uniforms.radius4 = { value: Math.pow(this.particleRadius, 4) };
    this.velocityVariable.material.uniforms.radius5 = { value: Math.pow(this.particleRadius, 5) };
    
    this.velocityVariable.material.uniforms.timestep = { value: this.timestep };
    //#endregion

    //#region force uniform
    this.forceVariable.material.uniforms.particleLength = { value: this.totalParticles };
    this.forceVariable.material.uniforms.particleMass = { value: this.particleMass };
    this.forceVariable.material.uniforms.viscosity = { value: this.viscosity };
    this.forceVariable.material.uniforms.gasConstant = { value: this.gasConstant };
    this.forceVariable.material.uniforms.restDensity = { value: this.restingDensity };
    this.forceVariable.material.uniforms.boundDamping = { value: this.boundDamping };
    this.forceVariable.material.uniforms.pi = { value: Math.PI };
    this.forceVariable.material.uniforms.boxSize = { value: this.boxSize };
    
    this.forceVariable.material.uniforms.radius = { value: this.particleRadius };
    this.forceVariable.material.uniforms.radius2 = { value: Math.pow(this.particleRadius, 2) };
    this.forceVariable.material.uniforms.radius3 = { value: Math.pow(this.particleRadius, 3) };
    this.forceVariable.material.uniforms.radius4 = { value: Math.pow(this.particleRadius, 4) };
    this.forceVariable.material.uniforms.radius5 = { value: Math.pow(this.particleRadius, 5) };
    
    this.forceVariable.material.uniforms.timestep = { value: this.timestep };
    //#endregion

    //#region density & pressure uniform
    this.denstPressVariable.material.uniforms.particleLength = { value: this.totalParticles };
    this.denstPressVariable.material.uniforms.particleMass = { value: this.particleMass };
    this.denstPressVariable.material.uniforms.viscosity = { value: this.viscosity };
    this.denstPressVariable.material.uniforms.gasConstant = { value: this.gasConstant };
    this.denstPressVariable.material.uniforms.restDensity = { value: this.restingDensity };
    this.denstPressVariable.material.uniforms.boundDamping = { value: this.boundDamping };
    this.denstPressVariable.material.uniforms.pi = { value: Math.PI };
    this.denstPressVariable.material.uniforms.boxSize = { value: this.boxSize };
    
    this.denstPressVariable.material.uniforms.radius = { value: this.particleRadius };
    this.denstPressVariable.material.uniforms.radius2 = { value: Math.pow(this.particleRadius, 2) };
    this.denstPressVariable.material.uniforms.radius3 = { value: Math.pow(this.particleRadius, 3) };
    this.denstPressVariable.material.uniforms.radius4 = { value: Math.pow(this.particleRadius, 4) };
    this.denstPressVariable.material.uniforms.radius5 = { value: Math.pow(this.particleRadius, 5) };
    
    this.denstPressVariable.material.uniforms.timestep = { value: this.timestep };
    //#endregion

    // ---------------

    // this.textureData = this.gpuCompute.createTexture();
    // this.textureData.image.data;

    // this.textureVariable = this.gpuCompute.addVariable('textureData', computeIntegratePosition, this.textureData);

    // this.gpuCompute.setVariableDependencies(this.textureVariable, [this.textureVariable]);

    // this.textureVariable.material.uniforms.particleLength = { value: this.totalParticles };
    // this.textureVariable.material.uniforms.particleMass = { value: 1.0 };
    // this.textureVariable.material.uniforms.viscosity = { value: 0.01 };
    // this.textureVariable.material.uniforms.gasConstant = { value: 1.4 };
    // this.textureVariable.material.uniforms.restDensity = { value: 1000.0 };
    // this.textureVariable.material.uniforms.boundDamping = { value: 0.9 };
    // this.textureVariable.material.uniforms.pi = { value: Math.PI };
    // this.textureVariable.material.uniforms.boxSize = { value: new THREE.Vector3(10, 10, 10) };

    // this.textureVariable.material.uniforms.radius = { value: this.particleRadius };
    // this.textureVariable.material.uniforms.radius2 = { value: Math.pow(this.particleRadius, 2) };
    // this.textureVariable.material.uniforms.radius3 = { value: Math.pow(this.particleRadius, 3) };
    // this.textureVariable.material.uniforms.radius4 = { value: Math.pow(this.particleRadius, 4) };
    // this.textureVariable.material.uniforms.radius5 = { value: Math.pow(this.particleRadius, 5) };
    
    // this.textureVariable.material.uniforms.timestep = { value:  0.016 };
    
    this.gpuCompute.init();
  }
  public updateVariable(): THREE.Texture{
    return this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
  }

  // 텍스처에 초깃값을 채우기 위한 함수
  private initParticlePosition() {
    const data = this.initialPosition.image.data;
    const tempMatrix = new THREE.Matrix4(); // 각 인스턴스의 매트릭스를 임시로 저장할 변수
    const tempPosition = new THREE.Vector3(); // 각 인스턴스의 위치를 임시로 저장할 변수

    for (let i = 0; i < (this.particleMesh as THREE.InstancedMesh).count; i++) {
      // InstancedMesh에서 i번째 파티클의 매트릭스를 가져옴
      (this.particleMesh as THREE.InstancedMesh).getMatrixAt(i, tempMatrix);

      // 매트릭스에서 위치 벡터를 추출
      tempPosition.setFromMatrixPosition(tempMatrix);

      // data 배열에 x, y, z 값 설정
      const index = i * 4;  // data 배열에서 x, y, z, alpha 값의 시작 인덱스
      data[index + 0] = tempPosition.x;
      data[index + 1] = tempPosition.y;
      data[index + 2] = tempPosition.z;
      data[index + 3] = 1.0; // Alpha (1.0으로 설정)
    }
    // console.log(this.initialPosition.image.data)
  }
}