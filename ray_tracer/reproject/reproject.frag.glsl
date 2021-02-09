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

vec4 textureClampToBlack(sampler2D tex, vec2 coord,float seed) {
	vec4 p = texture(tex,coord);
	if((coord.x>=1.0||coord.x<0.0||coord.y>=1.0||coord.y<0.0)) {
		p /= p.w;
		p *= hash1(seed)*0.1;
	}
	return p;
}

out vec4 outColor;

void main() {
	float seed = coord.x + (coord.y+937.8310762)*coord.y * 3.43121412313 + time/294.529562;
	vec2 offset = hash2(seed)-0.5;

	vec3 rayDirection = rayDirFromCameraPlane(coord.xy,resolution,offset,newCameraRot);
	vec3 worldPos;
	vec3 norm;
	vec3 normTest;
	vec4 material;
	vec4 materialTest;
	intersectSceneWithHitpointNormalMaterial(newCameraPos, rayDirection, worldPos, norm, material);
	vec3 oldDir = normalize(worldPos-oldCameraPos);
	vec2 oldCameraPlane = cameraPlaneFromRayDir(oldDir,resolution,offset,oldCameraRot);

	intersectSceneWithHitpointNormalMaterial(oldCameraPos, oldDir, worldPos, normTest, materialTest);
	if(material != materialTest || dot(norm,normTest)<0.975) {
		outColor = vec4(0.0,0.0,0.0,0.1);
		return;
	}

	vec4 pixel = textureClampToBlack(sampleTexture, oldCameraPlane.xy*0.5+0.5, seed);

	const float mul = 1.0/float(REPROJECTION_DISCARD_SAMPLE_COUNT)*TAU;
	for(int i=0; i<REPROJECTION_DISCARD_SAMPLE_COUNT; i++) {
		float a = float(i)*mul;
		offset = vec2(sin(a),cos(a))*REPROJECTION_DISCARD_RADIUS;

		vec3 rayDirectionTest = rayDirFromCameraPlane(oldCameraPlane.xy,resolution,offset,oldCameraRot);
		intersectSceneWithHitpointNormalMaterial(oldCameraPos, rayDirectionTest, worldPos, normTest, materialTest);
		if(material != materialTest || dot(norm,normTest)<0.975) {
			if(pixel.w>=0.1) pixel *= 0.1 / pixel.w;
		}

		// vec4 testPixel = textureClampToBlack(sampleTexture, (oldCameraPlane.xy+offset)*0.5+0.5, seed);
		// if(distance(pixel.xyz/pixel.w,testPixel.xyz/testPixel.w)>0.2) {
		// 	if(pixel.w>=1.0) pixel *= 0.1 / pixel.w;
		// }
	}

	pixel *= REPROJECTION_WEIGHT_FALLOFF_EXPRESSION;


	outColor = pixel;
}