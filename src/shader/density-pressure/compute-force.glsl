precision highp float;

uniform int particleLength;
uniform float particleMass;
uniform float viscosity;
uniform float gasConstant;
uniform float restDensity;
uniform float boundDamping;
uniform float pi;
uniform vec3 boxSize;
uniform float radius;
uniform float radius2;
uniform float radius3;
uniform float radius4;
uniform float radius5;
uniform float timestep;

// uniform sampler2D positionTexture;
// uniform sampler2D velocityTexture;
// uniform sampler2D forceTexture;
// uniform sampler2D densityPressureTexture;

// 첫 번째 도함수
float SpikyKernelFirstDerivative(float distance) {
    float x = 1.0 - distance / radius;
    return -45.0 / (pi * radius4) * x * x;
}

// 두 번째 도함수
float SpikyKernelSecondDerivative(float distance) {
    float x = 1.0 - distance / radius;
    return 90.0 / (pi * radius5) * x;
}

// 그라디언트 계산 함수
vec3 SpikyKernelGradient(float distance, vec3 direction) {
    return SpikyKernelFirstDerivative(distance) * direction;
}

float StdKernel(float distanceSquared) {
  float x = 1.0f - distanceSquared / radius2;
  return 315.0 / (64.0 * pi * radius3) * x * x * x;
}

void main() {
    float id = float(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= float(particleLength)) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        return;
    }

    // 파티클 위치 읽기
    vec3 origin = texture2D(positionTexture, vec2(id / float(particleLength))).xyz;
    float sum = 0.0;

    for (float i = 0.5; int(i) < particleLength; i++) {

        vec3 otherPos = texture2D(positionTexture, vec2(i / float(particleLength))).xyz;
        vec3 diff = origin - otherPos;
        float distanceSquared = dot(diff, diff);
        
        if (radius2 * 0.004 > distanceSquared * 0.004) {
            sum += StdKernel(distanceSquared * 0.004);
        }
    }

    // 파티클 밀도 및 압력 계산
    float density = sum * particleMass + 0.000001;
    float pressure = gasConstant * (density - restDensity);

    // ---------------

    // float density = texture2D(densityPressureTexture, vec2(id / float(particleLength))).x;
    // float pressure = texture2D(densityPressureTexture, vec2(id / float(particleLength))).y;
    float density2 = density * density;
    float mass2 = particleMass * particleMass;
    vec3 resultPressure = vec3(0.0);
    vec3 visc = vec3(0.0);

    // if (density != density || pressure != pressure){
    //     gl_FragColor = vec4(0.0);
    //     return;
    // }

    for (float i = 0.5; int(i) < particleLength; i++) {
        vec3 otherPosition = texture2D(positionTexture, vec2(i / float(particleLength))).xyz;
        
        // 자기 자신과 비교하지 않기
        if (id == i) continue;

        float dist = distance(otherPosition, origin);
        if (dist < radius * 2.0) {
            // 압력 계산
            vec3 pressureGradientDirection = normalize(origin - otherPosition);

            vec3 pressureContribution = mass2 * SpikyKernelGradient(dist, pressureGradientDirection);
            // float otherDensity = texture2D(densityPressureTexture, vec2(i / float(particleLength))).x;
            // float otherPressure = texture2D(densityPressureTexture, vec2(i / float(particleLength))).y;

            // makeshift method
            float otherDensity = density;
            float otherPressure = pressure;
            pressureContribution *= (pressure / density2) + otherPressure / (otherDensity * otherDensity);

            // 점성 계산
            vec3 velocity = texture2D(velocityTexture, vec2(id / float(particleLength))).xyz;
            vec3 otherVelocity = texture2D(velocityTexture, vec2(i / float(particleLength))).xyz;
            vec3 viscosityContribution = viscosity * mass2 * (otherVelocity - velocity) / otherDensity;
            viscosityContribution *= SpikyKernelSecondDerivative(dist);
            
            resultPressure += pressureContribution;
            visc += viscosityContribution;
        }
    }

    // 중력 힘 적용
    vec3 currentForce = vec3(0, -9.81 * particleMass, 0) - resultPressure + visc;
    gl_FragColor = vec4(currentForce, 1.0);
}
