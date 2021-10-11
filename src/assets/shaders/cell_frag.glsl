#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
#define PI 3.1415926535

out vec4 FragColor;

precision highp float;
uniform float uTime;
uniform vec4 uColor;
uniform sampler2D uPalette;
uniform float uRoundness;
uniform float uBrightness;
uniform float uAngle;
uniform float uRadius;
varying vec2 vUv;
varying vec4 vMVPos;


float smin( float a, float b, float k )
{
    float res = exp2( -k*a ) + exp2( -k*b );
    return -log2( res )/k;
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
           vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
    float scale = 2.;
    vec2 cuv = vUv - vec2(0.5, 0.5);
    float dist = length(cuv);
    float roundMask = 1. - smoothstep(0.495, 0.5, dist);
    float alpha = uColor.a * roundMask;

    if (alpha < 0.01) discard;

    vec2 rv = vec2(atan(cuv.y, cuv.x) / PI / 2., length(cuv));

    float n = noise(vec2(sin(rv.x * PI * 2.), rv.y * 4. - uTime * 0.03) * 8.);

    float innerRad = 0.22 + uBrightness * 0.02;
    float outRad = sin(rv.x * 18. * PI) * 0.08 + 0.64;    
    float tr = smoothstep(outRad, outRad + 0.02, 1. - rv.y);
    tr *= smoothstep(innerRad, innerRad + 0.01, rv.y);

    float px = smoothstep(0., 0.5, dist) + n * 0.05;
    vec3 t1 = texture2D(uPalette, vec2(px, 0.45)).rgb;
    vec3 t2 = texture2D(uPalette, vec2(px, 0.35)).rgb;

    px = pow(px, 1.2 + uBrightness * 2.5);
    vec3 t1b = mix(
        texture2D(uPalette, vec2(px, 0.95)).rgb,
        texture2D(uPalette, vec2(px + 0.065, 0.95)).rgb,
        0.5);
    vec3 t2b = texture2D(uPalette, vec2(px, 0.85)).rgb;

    vec3 t3 = texture2D(uPalette, vec2(sin(rv.x * PI * 2.), 0.7)).rgb;

    vec3 lit = mix(t1b, t2b, tr);
    vec3 unlit = mix(t1, t2, tr);

    alpha *= smoothstep(-1., -0.95, uBrightness);
    vec3 color = mix(unlit, lit, smoothstep(-1., 0., uBrightness));
    color = mix(color, t3, smoothstep(0.475 + uBrightness * 0.01, 0.49, dist));
    
    gl_FragColor.rgb = color;
    gl_FragColor.a = alpha;
}