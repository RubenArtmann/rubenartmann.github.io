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
uniform vec3 oldCameraRot;
uniform vec3 newCameraRot;

#include ./shaders/random.glsl
#include ./shaders/scene.glsl
#include ./shaders/camera.glsl

vec4 textureClampToBlack(sampler2D tex, vec2 coord) {
	vec4 p = texture(tex,coord);
	if((coord.x>=1.0||coord.x<0.0||coord.y>=1.0||coord.y<0.0) && p.w>1.0) p /= p.w*3.0;
	return p;
}

out vec4 outColor;

void main() {
	float seed = coord.x + (coord.y+937.8310762)*coord.y * 3.43121412313 + time/294.529562;

	vec2 offset = hash2(seed);

	vec3 rayDirection = rayDirFromCameraPlane(coord.xy,resolution,offset,newCameraRot);
	vec3 worldPos;
	vec3 norm;
	vec3 normTest;
	vec4 material;
	vec4 materialTest;
	intersectScene(newCameraPos, rayDirection, worldPos, norm, material);
	vec3 oldDir = normalize(worldPos-oldCameraPos);
	vec2 oldCameraPlane = cameraPlaneFromRayDir(oldDir,resolution,offset,oldCameraRot);

	intersectScene(oldCameraPos, oldDir, worldPos, normTest, materialTest);
	if(material != materialTest || dot(norm,normTest)<0.99) {
		outColor = vec4(0.0,0.0,0.0,0.0);
		return;
	}

	vec4 pixel = textureClampToBlack(sampleTexture, oldCameraPlane.xy*0.5+0.5);

	for(int i=0; i<REPROJECTION_DISCARD_SAMPLE_COUNT; i++) {
		float a = hash1(seed)*TAU;
		offset = vec2(sin(a),cos(a))*REPROJECTION_DISCARD_RADIUS;
		vec3 rayDirectionTest = rayDirFromCameraPlane(oldCameraPlane.xy,resolution,offset,oldCameraRot);
		intersectScene(oldCameraPos, rayDirectionTest, worldPos, normTest, materialTest);
		if(material != materialTest || dot(norm,normTest)<0.99) {
			if(pixel.w>=1.0) pixel /= pixel.w / 0.1;
		}
	}

	pixel *= REPROJECTION_WEIGHT_FALLOFF;


	outColor = pixel;
}