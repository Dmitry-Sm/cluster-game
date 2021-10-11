attribute vec2 uv;
attribute vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec4 vMVPos;

void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z -= 0.5;
    vMVPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * vMVPos;
}