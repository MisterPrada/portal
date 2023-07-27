uniform vec3 uColor;
uniform sampler2D uMaskTexture;
uniform sampler2D uAudioData;

void main()
{
    float audioF = texture2D(uAudioData, vec2( gl_PointCoord.x, 0.0 ) ).r;
    float mask = texture2D(uMaskTexture, gl_PointCoord).r;
    gl_FragColor = vec4(uColor * audioF, mask);
}
