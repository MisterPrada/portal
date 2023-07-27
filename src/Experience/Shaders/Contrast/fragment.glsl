uniform sampler2D tDiffuse;
uniform float contrast;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec3 c = color.rgb - 0.5;
    c *= contrast;
    c += 0.5;
    gl_FragColor = vec4(c, color.a);
}
