precision highp float;

uniform float timestep;
uniform float particleMass;
uniform vec3 boxSize;
uniform float radius;
uniform float boundDamping;
uniform int particleLength;

// uniform sampler2D positionTexture;
// uniform sampler2D velocityTexture;
// uniform sampler2D forceTexture;
// uniform sampler2D densityPressureTexture;

void main() {
    int id = int(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= particleLength) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        return;
    }

    vec3 position = texture2D(positionTexture, vec2(gl_FragCoord.xy / resolution.xy)).xyz;
    vec3 velocity = texture2D(velocityTexture, vec2(gl_FragCoord.xy / resolution.xy)).xyz;
    vec3 force = texture2D(forceTexture, vec2(gl_FragCoord.xy / resolution.xy)).xyz;

    // 새로운 속도 계산
    vec3 newVelocity = velocity + ((force / particleMass) * timestep);
    vec3 newPosition = position + newVelocity * timestep;

    vec3 topRight = boxSize / 2.0;
    vec3 bottomLeft = -boxSize / 2.0;
    
    // Min Boundary Enforcements
    if (newPosition.x - radius < bottomLeft.x) {
        newVelocity.x *= boundDamping;
    }
    if (newPosition.y - radius < bottomLeft.y) {
        newVelocity.y *= boundDamping;
    }
    if (newPosition.z - radius < bottomLeft.z) {
        newVelocity.z *= boundDamping;
    }

    // Max Boundary Enforcements
    if (newPosition.x + radius > topRight.x) {
        newVelocity.x *= boundDamping;
    }
    if (newPosition.y + radius > topRight.y) {
        newVelocity.y *= boundDamping;
    }
    if (newPosition.z + radius > topRight.z) {
        newVelocity.z *= boundDamping;
    }

    // 속도를 vec4로 저장
    gl_FragColor = vec4(newVelocity, 1.0);
}
