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

#include ./shaders/scene.glsl
#include ./shaders/camera.glsl

// from https://github.com/FoxelFox/voxel-octree/blob/master/src/render/pipeline/v2/node/rt-chunk-node/rt-chunk-node.fs.glsl
uint baseHash( uvec2 p ) {
	p = 1103515245U*((p >> 1U)^(p.yx));
	uint h32 = 1103515245U*((p.x)^(p.y>>3U));
	return h32^(h32 >> 16);
}
// from https://github.com/FoxelFox/voxel-octree/blob/master/src/render/pipeline/v2/node/rt-chunk-node/rt-chunk-node.fs.glsl
float hash1( inout float seed ) {
	uint n = baseHash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
	return float(n)/float(0xffffffffU);
}
// from https://github.com/FoxelFox/voxel-octree/blob/master/src/render/pipeline/v2/node/rt-chunk-node/rt-chunk-node.fs.glsl
vec2 hash2( inout float seed ) {
	uint n = baseHash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
	uvec2 rz = uvec2(n, n*48271U);
	return vec2(rz.xy & uvec2(0x7fffffffU))/float(0x7fffffff);
}

vec4 textureClampToBlack(sampler2D tex, vec2 coord) {
	vec4 p = texture(tex,coord);
	if((coord.x>=1.0||coord.x<0.0||coord.y>=1.0||coord.y<0.0) && p.w>1.0) p /= p.w;
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

	float r = 2.5;
	float a = hash1(seed)*TAU;
	offset = vec2(sin(a),cos(a))*r;
	vec3 rayDirectionTest = rayDirFromCameraPlane(coord.xy,resolution,offset+vec2(0.5),newCameraRot);
	intersectScene(newCameraPos, rayDirectionTest, worldPos, normTest, materialTest);
	if(material != materialTest || dot(norm,normTest)<0.99) {
		if(pixel.w>=1.0) pixel /= pixel.w / 0.1;
	}

	pixel *= 0.9;


	outColor = pixel;
}