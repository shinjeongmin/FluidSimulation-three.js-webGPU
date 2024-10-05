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

void main() {
    int id = int(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= particleLength) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        return;
    }


    vec3 origin = texture2D(positionTexture, vec2(float(id) / float(particleLength))).xyz;
    float density = texture2D(densityPressureTexture, vec2(float(id) / float(particleLength))).x;
    float pressure = texture2D(densityPressureTexture, vec2(float(id) / float(particleLength))).y;
    float density2 = density * density;
    float mass2 = particleMass * particleMass;
    vec3 resultPressure = vec3(0.0);
    vec3 visc = vec3(0.0);

    if(density == 0.0) {
        density = 1.0;
    }

    for (int i = 0; i < particleLength; i++) {
        vec3 otherPosition = texture2D(positionTexture, vec2(float(i) / float(particleLength))).xyz;
        
        // 자기 자신과 비교하지 않기
        if (origin == otherPosition) continue;

        float dist = distance(origin, otherPosition);
        if (dist < radius * 2.0) {
            // 압력 계산
            vec3 pressureGradientDirection = normalize(origin - otherPosition);

            vec3 pressureContribution = mass2 * SpikyKernelGradient(dist, pressureGradientDirection);
            float otherDensity = texture2D(densityPressureTexture, vec2(float(i) / float(particleLength))).x;
            float otherPressure = texture2D(densityPressureTexture, vec2(float(i) / float(particleLength))).y;
            pressureContribution *= (pressure / density2) + otherPressure / (otherDensity * otherDensity);

            // 점성 계산
            vec3 velocity = texture2D(velocityTexture, vec2(float(id) / float(particleLength))).xyz;
            vec3 otherVelocity = texture2D(velocityTexture, vec2(float(i) / float(particleLength))).xyz;
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
