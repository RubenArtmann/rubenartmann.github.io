#version 300 es
in vec3 coordinates;

out vec3 coord;

void main(void) {
	coord = coordinates;
	gl_Position = vec4(coordinates, 1.0);
}