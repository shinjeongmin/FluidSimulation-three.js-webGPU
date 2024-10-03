precision mediump float;

struct Particle{
    float pressure;
    float density;
    vec3 currentForce;
    vec3 velocity;
    vec3 position;
};

uniform float particleMass;
uniform float viscosity;
uniform float gasConstant;
uniform float restDensity;
uniform float boundDamping;
uniform float radius;
uniform float radius2;
uniform float radius3;
uniform float radius4;
uniform float radius5;
uniform float pi;
uniform int particleLength;
uniform float timestep;
uniform vec3 boxSize;

uniform Particle _particles[100];  // WebGL의 경우 배열 크기 명시 필요

void main() {
    int id = int(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= particleLength) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        return;
    }

    Particle particle = _particles[id];

    particle.currentForce = vec3(0, -9.81 * particleMass, 0);

    vec3 vel = particle.velocity + ((particle.currentForce / particleMass) * timestep);
    vec3 newPosition = particle.position + vel * timestep;

    vec3 topRight = boxSize / 2.0;
    vec3 bottomLeft = -boxSize / 2.0;

    // Min Boundary Enforcements
    if (newPosition.x - radius < bottomLeft.x) {
        vel.x *= boundDamping;
        newPosition.x = bottomLeft.x + radius;
    }
    if (newPosition.y - radius < bottomLeft.y) {
        vel.y *= boundDamping;
        newPosition.y = bottomLeft.y + radius;
    }
    if (newPosition.z - radius < bottomLeft.z) {
        vel.z *= boundDamping;
        newPosition.z = bottomLeft.z + radius;
    }

    // Max Boundary Enforcements
    if (newPosition.x + radius > topRight.x) {
        vel.x *= boundDamping;
        newPosition.x = topRight.x - radius;
    }
    if (newPosition.y + radius > topRight.y) {
        vel.y *= boundDamping;
        newPosition.y = topRight.y - radius;
    }
    if (newPosition.z + radius > topRight.z) {
        vel.z *= boundDamping;
        newPosition.z = topRight.z - radius;
    }

    // 속도와 위치 업데이트
    gl_FragColor = vec4(newPosition, 1.0);  // 위치 데이터를 RGBA 형태로 저장
}