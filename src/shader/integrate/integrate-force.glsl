precision mediump float;

uniform float particleMass;
uniform int particleLength;

// uniform sampler2D forceTexture;     // 힘을 입력으로 받음

void main() {
    int id = int(gl_FragCoord.x);  // 각 픽셀은 파티클 ID와 매핑

    if (id >= particleLength) {
        gl_FragColor = vec4(0.0);  // 범위 밖일 경우 아무런 작업도 하지 않음
        return;
    }

    // 중력 힘 적용
    vec3 force = vec3(0, -9.81 * particleMass, 0);

    // 힘을 vec4로 저장
    gl_FragColor = vec4(force, 1.0);
}
