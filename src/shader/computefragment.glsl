//computeFragment
void main() {
    vec2 vUv = gl_FragCoord.xy / resolution.xy;
    vec2 position = texture2D( textureData, vUv ).xy;
    
    position.x += 0.001;
    
    gl_FragColor = vec4( position, 0.0, 1.0);
}