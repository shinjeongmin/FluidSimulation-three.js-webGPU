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

float StdKernel(float distanceSquared) {
  float x = 1.0f - distanceSquared / radius2;
  return 315.0 / (64.0 * pi * radius3) * x * x * x;
}

void main() {
    float id = gl_FragCoord.x;

    if (int(id) >= particleLength) {
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

    // 결과 출력 (압력, 밀도를 텍스처에 쓰는 방법은 WebGL의 FBO를 통해 처리해야 함)
    // gl_FragColor로 간단히 출력
    gl_FragColor = vec4(density, pressure, 0.0, 1.0); 
}