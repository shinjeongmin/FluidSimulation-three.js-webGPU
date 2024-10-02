uniform sampler2D uTexture;

//vertexshader
void main()
{
    vec3 newpos = position;
    vec4 color = texture2D(uTexture, uv);

    newpos.x += color.x;

    vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.0);
    gl_PointSize = 10.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
}