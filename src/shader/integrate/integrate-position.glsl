precision mediump float;

uniform float timestep;
uniform float particleMass;
uniform vec3 boxSize;
uniform float radius;
uniform float boundDamping;
uniform int particleLength;

// 첫 compute shader에서는 중복된 uniform
// uniform sampler2D velocityTexture;  // 속도를 입력으로 받음
// uniform sampler2D positionTexture;  // 이전 위치를 입력으로 받음

void main() {
    int id = int(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= particleLength) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        return;
    }

    vec3 position = texture2D(positionTexture, vec2(gl_FragCoord.x / resolution.x)).xyz;
    vec3 velocity = texture2D(velocityTexture, vec2(gl_FragCoord.x / resolution.x)).xyz;

    vec3 newPosition = position + velocity * timestep;

    vec3 topRight = boxSize / 2.0;
    vec3 bottomLeft = -boxSize / 2.0;

    // Min Boundary Enforcements
    if (newPosition.x - radius < bottomLeft.x) {
        newPosition.x = bottomLeft.x + radius;
    }
    if (newPosition.y - radius < bottomLeft.y) {
        newPosition.y = bottomLeft.y + radius;
    }
    if (newPosition.z - radius < bottomLeft.z) {
        newPosition.z = bottomLeft.z + radius;
    }

    // Max Boundary Enforcements
    if (newPosition.x + radius > topRight.x) {
        newPosition.x = topRight.x - radius;
    }
    if (newPosition.y + radius > topRight.y) {
        newPosition.y = topRight.y - radius;
    }
    if (newPosition.z + radius > topRight.z) {
        newPosition.z = topRight.z - radius;
    }

    // 새로운 위치를 vec4로 저장
    gl_FragColor = vec4(newPosition, 1.0);
}
