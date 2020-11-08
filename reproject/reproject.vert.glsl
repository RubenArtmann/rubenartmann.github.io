#version 300 es
precision highp float;

in vec3 coordinates;

out vec3 coord;

void main() {
	coord = coordinates;
    gl_Position = vec4(coordinates, 1);
}