//vertexshader
void main()
{
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 10.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
}