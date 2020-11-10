#version 300 es
precision highp float;

#include ./shaders/const.glsl
#include ./shaders/camera.glsl

in vec3 coord;
uniform float time;
uniform vec2 resolution;
uniform vec3 cameraPos;
uniform vec3 cameraRot;

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

//https://graphics.pixar.com/library/OrthonormalB/paper.pdf
void branchlessONB(vec3 n, inout vec3 b1, inout vec3 b2){
	float sign = sign(n.z+EPSILON);
	float a = -1.0 / (sign + n.z);
	float b = n.x*n.y*a;
	b1 = vec3(1.0 + sign*n.x*n.x*a, sign*b, -sign*n.x);
	b2 = vec3(b, sign + n.y*n.y*a, -n.y);
}

// https://www.shadertoy.com/view/4tl3z4
vec3 cosWeightedRandomHemisphereDirection( const vec3 n, inout float seed ) {
	vec2 r = hash2(seed);
	// vec3 uu = normalize(cross(n, abs(n.y) > .5 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
	// vec3 vv = cross(uu, n);
	vec3 uu, vv;
	branchlessONB(n,uu,vv);
	float ra = sqrt(r.y);
	float rx = ra*cos(TAU*r.x);
	float ry = ra*sin(TAU*r.x);
	float rz = sqrt(1.-r.y);
	vec3  rr = vec3(rx*uu + ry*vv + rz*n);
	return normalize(rr);
}

#include ./shaders/scene.glsl

vec3 nextEventEstimation(vec3 rayOrigin, vec3 norm, inout float seed) {
	#ifdef ENABLE_HACKED_NEXT_EVENT_ESTIMATION
	vec3 light = vec3(0.0);
	for(int i=0; i<LIGHT_COUNT; i++) {
		vec4 sphere = lights[i];
		vec3 vector = sphere.xyz-rayOrigin;
		vec3 dir = normalize(vector);

		float area = PI*sphere.w*sphere.w;// approx for large distances
		float areaFraction = area/(4.0*PI*dot(vector,vector));

		// vec3 vx = cross(dir,vec3(0.0,0.0,1.0));
		// vec3 vy = cross(dir,vx);
		vec3 vx,vy;
		branchlessONB(dir,vx,vy);

		// point on circle
		float t = 2.0*PI*hash1(seed);
		float u = hash1(seed)+hash1(seed);
		float r = (u>1.0?2.0-u:u)*sphere.w;

		vec3 pointOnSphereCrosssectionRelativeToRayOrigin = vector + vx*r*cos(t)+vy*r*sin(t);
		vec3 newDir = normalize(pointOnSphereCrosssectionRelativeToRayOrigin);
		vec3 scratch = vec3(0.0);
		vec4 material;
		intersectScene(rayOrigin, newDir, scratch, scratch, material);
		//assume no overlap between lights
		if(material == materials[i]) {
			float cost = dot(newDir,norm);
			if(cost>0.0) {
				light += material.xyz * areaFraction * 2.0 * cost * PI;
			}
		}
	}

	return light / float(LIGHT_COUNT);
	#endif


	vec3 sum = vec3(0.0);
	for(int i=0; i<DIRECT_SAMPLES; i++) {
		vec3 rayDirection = cosWeightedRandomHemisphereDirection(norm,seed);
		vec3 scratch = vec3(0.0);
		vec4 material;
		intersectScene(rayOrigin, rayDirection, scratch, scratch, material);
		if(material.w>0.5) {
			sum += material.xyz;
		}
	}
	return sum / float(DIRECT_SAMPLES);
}

out vec4 pixel;
void main(void) {
	float seed = coord.x + (coord.y+937.8310762)*coord.y * 3.43121412313 + time/294.529562;
	
	pixel = vec4(vec3(0.0,0.0,0.0),1.0);


	vec3 rayOrigin = cameraPos;
	vec3 rayDirection = rayDirFromCameraPlane(coord.xy,resolution,hash2(seed)-0.5,cameraRot);

	vec3 color = vec3(1.0,1.0,1.0);

	vec3 norm = vec3(0.0);
	vec4 material = vec4(0.0);

	int pathlength = 0;
	while(true) {
		pathlength++;

		float dist = intersectScene(rayOrigin, rayDirection, rayOrigin, norm, material);
		if(material.w>0.0) {
			#ifdef NEXT_EVENT_ESTIMATION
			if(material.w>0.5 && pathlength>1) break;
			// break;
			#endif
			pixel.xyz += color * material.xyz;
			return;
		}
		color = color * material.xyz;

		float prob = PATH_PROPABILITY_EXPRESSION;

		#ifdef NEXT_EVENT_ESTIMATION
		pixel.xyz += color * nextEventEstimation(rayOrigin,norm,seed);
		#endif

		if(hash1(seed)>prob) {
			break;
			#ifndef NEXT_EVENT_ESTIMATION
			break;
			#endif
		}
		color = color / prob;

		rayDirection = cosWeightedRandomHemisphereDirection(norm,seed);
	}
}