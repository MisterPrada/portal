uniform sampler2D uMaskTexture;
uniform vec3 uColor;
uniform float uAlpha;
uniform sampler2D uAudioData;

varying vec3 vModelPosition;
varying vec2 vUv;

void main()
{
    float audioF = texture2D(uAudioData, vec2( vUv.x, 0.0 ) ).r;
    float outerAlpha = min(1.0, 1.0 - (length(vModelPosition.xy) - 1.0) * 10.0);

    float maskStrength = texture2D(uMaskTexture, vUv).r * outerAlpha * uAlpha;

    gl_FragColor = vec4(uColor * audioF, maskStrength);
}
