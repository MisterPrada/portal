uniform sampler2D uFBOTexture;
uniform sampler2D uMaskTexture;
uniform float uPixelRatio;
uniform float uSize;
uniform sampler2D uAudioData;

attribute vec2 aFboUv;
attribute float aSize;


void main()
{
    float audioF = texture2D(uAudioData, vec2( aFboUv.x, 0.0 ) ).r;
    vec4 fboColor = texture2D(uFBOTexture, aFboUv);

    vec4 modelPosition = modelMatrix * vec4(fboColor.xyz, 1.0);

    modelPosition.z += audioF / 2.0;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;



    float lifeSize = min((1.0 - fboColor.a) * 10.0, fboColor.a * 2.0);
    lifeSize = clamp(lifeSize, 0.0, 1.0);

    gl_PointSize = uSize * uPixelRatio * lifeSize * aSize;
    gl_PointSize *= (1.0 / - viewPosition.z);
}
