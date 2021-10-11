#define PI 3.1415926535
precision highp float;
uniform float uTime;
uniform vec4 uColor;
uniform vec2 uResolution;
uniform float uRoundness;
uniform sampler2D tMap;
varying vec2 vUv;
varying vec4 vMVPos;

vec4 bokeh(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color = max(color, texture2D(image, uv));
  color = max(color, texture2D(image, uv + (off1 / resolution)));
  color = max(color, texture2D(image, uv - (off1 / resolution)));
  color = max(color, texture2D(image, uv + (off2 / resolution)));
  color = max(color, texture2D(image, uv - (off2 / resolution)));
  color = max(color, texture2D(image, uv + (off3 / resolution)));
  color = max(color, texture2D(image, uv - (off3 / resolution)));
  return color;
}

void main() {
    float t = uTime * 0.0001;
    vec2 cuv = vUv - vec2(0.5, 0.5);

    vec2 nuv = cuv;
    nuv *= 1. - smoothstep(1., 0., length(cuv)) * 0.2;
    nuv += vec2(0.5);

    vec2 dir = normalize(cuv) * 28.;
    vec3 tex = bokeh(tMap, nuv, vec2(uResolution.x, uResolution.y), dir).rgb;
    tex *= 0.1;

    vec3 color = tex;
    // color *= smoothstep(0.55, 0.4, length(cuv));
    color *= smoothstep(0., 0.3, length(cuv)) * 0.9 + 0.1;
    
    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.;
}