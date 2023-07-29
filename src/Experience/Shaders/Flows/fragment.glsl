uniform sampler2D uMaskTexture;
uniform float uOpacity;

void main()
{
    float mask = texture2D(uMaskTexture, gl_PointCoord).r;
    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), mask * uOpacity);
}
