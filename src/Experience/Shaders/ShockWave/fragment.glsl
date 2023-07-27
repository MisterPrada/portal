uniform sampler2D baseTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform vec3 uWaveParams;
varying vec2 vUv;

void main() {
    //Sawtooth function to pulse from centre.
    float offset = (uTime- floor(uTime))/uTime;
    float CurrentTime = (uTime)*(offset);

    vec3 WaveParams = uWaveParams.xyz;

    float ratio = uResolution.y/uResolution.x;

    //Use this if you want to place the centre with the mouse instead
    //vec2 WaveCentre = vec2( iMouse.xy / uResolution.xy );

    vec2 WaveCentre = uCenter.xy;
    WaveCentre.y *= ratio;

    //vec2 texCoord = gl_FragCoord.xy / uResolution.xy;
    vec2 texCoord = vUv.xy;
    vec2 texCoord2 = vUv.xy;
    //texCoord.y *= ratio;
    texCoord2.y *= ratio;
    float Dist = distance(texCoord2, WaveCentre);

    vec4 Color = texture(baseTexture, texCoord);

    //Only distort the pixels within the parameter distance from the centre
    if ((Dist <= ((CurrentTime) + (WaveParams.z))) && (Dist >= ((CurrentTime) - (WaveParams.z))))
    {
        //The pixel offset distance based on the input parameters
        float Diff = (Dist - CurrentTime);
        float ScaleDiff = (1.0 - pow(abs(Diff * WaveParams.x), WaveParams.y));
        float DiffTime = (Diff  * ScaleDiff);

        //The direction of the distortion
        vec2 DiffTexCoord = normalize(texCoord - WaveCentre);

        //Perform the distortion and reduce the effect over time
        texCoord += ((DiffTexCoord * DiffTime) / (CurrentTime * Dist * 40.0));
        Color = texture(baseTexture, texCoord);

        //Blow out the color and reduce the effect over time
        Color += (Color * ScaleDiff) / (CurrentTime * Dist * 40.0);
    }

    gl_FragColor = Color;
}
