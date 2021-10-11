#define PI 3.1415926535
precision highp float;
uniform sampler2D tMap;
uniform float uBlurStep;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

vec4 fxaa(sampler2D tex, vec2 uv, vec2 resolution) {
    vec2 pixel = vec2(1) / resolution;
    vec3 l = vec3(0.299, 0.587, 0.114);
    float lNW = dot(texture2D(tex, uv + vec2(-1, -1) * pixel).rgb, l);
    float lNE = dot(texture2D(tex, uv + vec2( 1, -1) * pixel).rgb, l);
    float lSW = dot(texture2D(tex, uv + vec2(-1,  1) * pixel).rgb, l);
    float lSE = dot(texture2D(tex, uv + vec2( 1,  1) * pixel).rgb, l);
    float lM  = dot(texture2D(tex, uv).rgb, l);
    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
    float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
    
    vec2 dir = vec2(
        -((lNW + lNE) - (lSW + lSE)),
        ((lNW + lSW) - (lNE + lSE))
    );
    
    float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(8, 8), max(vec2(-8, -8), dir * rcpDirMin)) * pixel;
    
    vec3 rgbA = 0.5 * (
        texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)).rgb +
        texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D(tex, uv + dir * -0.5).rgb +
        texture2D(tex, uv + dir * 0.5).rgb);
    float lB = dot(rgbB, l);
    return mix(
        vec4(rgbB, 1),
        vec4(rgbA, 1),
        max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0)
    );
}

vec3 blur(sampler2D image, vec2 uv, vec2 resolution) {
    vec3 tot = vec3(0.0);
    const int steps = 9;
    
    for( int j=0; j < steps; j++ )
    for( int i=0; i < steps; i++ )
    {
        vec2 st = ( uv + vec2(i-4,j-4) / resolution );
        vec3 co = texture2D( image, vec2(st.x, st.y) ).xyz;
        
        tot += co;
    }

    return tot / float(steps * steps);
}

vec2 line (vec2 a, vec2 b, vec2 p)
{
    vec2 pa = p-a, ba = b-a;
    float h = min(1., max(0., dot(pa, ba)/dot(ba, ba)));
    
    return vec2(length(pa - ba * h), h);
}

float leftSide(vec2 a, vec2 b, vec2 p) {    
 	return 1. - step(0.0, (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y));
}

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec3 color = fxaa(tMap, vUv, uResolution).rgb;
    float blurMask = 0.;

    float border = clamp(1. - uBlurStep, 0., 1.);
    border = smoothstep(border, border + 0.01, vUv.y);
    blurMask = border;
    
    float sp = PI/1.5;
    float a = uTime;
    float ac = -uTime * 0.15;
    vec2 pc = vec2(sin(ac), cos(ac));
    vec2 p1 = vec2(sin(a), cos(a));
    vec2 p2 = vec2(sin(a + sp), cos(a + sp));
    vec2 p3 = vec2(sin(a + sp * 2.), cos(a + sp * 2.));

    a = smoothstep(0.4, .6, sin(uTime * 0.4));
    vec2 tuv = (vUv - vec2(0.45) + pc * 0.15) * (40. - 28. * a) * vec2(aspect, 1.);
    float ins = min(leftSide(p1, p2, tuv), min(leftSide(p2, p3, tuv), leftSide(p3, p1, tuv))) * a;

    a = smoothstep(0.2, .4, sin(uTime * 0.4 + 2.));
    tuv = (vUv - vec2(0.55) - pc * 0.2) * (40. - 32. * a) * vec2(aspect, 1.);
    ins += min(leftSide(p1, p2, tuv), min(leftSide(p2, p3, tuv), leftSide(p3, p1, tuv))) * a;

    ins = clamp(ins, 0., 1.);
    blurMask = max(blurMask, ins);

    float diag = vUv.x + vUv.y + uTime * 0.15;
    diag = smoothstep(0.95, 0.951, fract(diag * 1.));
    diag *= smoothstep(0.7, 0.2, vUv.y);
    diag *= smoothstep(0.5, 1., sin(uTime * 1.));
    blurMask = max(blurMask, diag);

    float vig = smoothstep(0.45, 0.55, length(vUv - vec2(0.5)));
    blurMask = max(blurMask, vig);

    if (blurMask > 0.) {
        vec3 blur = blur(tMap, vUv, uResolution * 0.5);
        color = mix(color, blur, blurMask);
    }

    // color *= smoothstep(0.55, 0.4, length(vUv - vec2(0.5)));

    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.;
}