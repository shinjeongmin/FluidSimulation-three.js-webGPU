## three.js Fluid Simulation with SPH

## test step : particle gravity acceleration
I used the <b>GPUComputationRenderer</b> plugin as a means to utilize GPGPU in the three.js environment.

![integrate function](./readme-image/gravity-acceleration.gif)

## implement SPH fluid simulation using GPGPU
Massive particle computations using the GPU.  
The fluid simulation was implemented using the SPH method,  
and the number of particles in the video below is 20x20x20.

![SPH simulation](./readme-image/particle20x20x20.gif)

## Things Learned After Using GPUComputationRenderer in three.js
Even when using the GPU to compute particles,<br>
if the number of particles exceeds a certain threshold,<br>
it's not just that the speed slows down, but WebGL stops rendering altogether.