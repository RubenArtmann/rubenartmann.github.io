#version 300 es
precision highp float;

#include ./shaders/const.glsl

in vec3 coord;

uniform sampler2D sampleTexture;
uniform vec2 resolution;
uniform float sampleCount;
uniform float time;

uniform vec3 oldCameraPos;
uniform vec3 newCameraPos;

#include ./shaders/scene.glsl
#include ./shaders/camera.glsl

out vec4 outColor;

void main() {
	vec3 rayDirection = rayDirFromCameraPlane(coord,resolution,vec2(0.0));
	vec3 worldPos;
	vec3 norm;
	vec4 material;
	float dist = intersectScene(newCameraPos, rayDirection, worldPos, norm, material);
	vec2 oldCameraPlane = cameraPlaneFromRayDir(normalize(worldPos-oldCameraPos),resolution,vec2(0.0));

	vec4 pixel = texture(sampleTexture, coord.xy*0.5+0.5);
	vec3 color = pixel.xyz / sampleCount;
	// pixel = vec4(sampleCount,0.0,0.0,1.0);
	outColor = vec4(pixel.xyz,1.0);
}