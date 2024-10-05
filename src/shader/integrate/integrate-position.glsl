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

void main() {
    int id = int(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= particleLength) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        // id = vec4(0.0);
        return;
    }

    vec3 position = texture2D(positionTexture, vec2(gl_FragCoord.x / float(particleLength))).xyz;
    vec3 velocity = texture2D(velocityTexture, vec2(gl_FragCoord.x / float(particleLength))).xyz;

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
