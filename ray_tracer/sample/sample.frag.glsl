#version 300 es
precision highp float;

#include ./shaders/const.glsl
#include ./shaders/camera.glsl

in vec3 coord;
uniform sampler2D sampleTexture;
uniform float time;
uniform float sampleCount;
uniform vec2 resolution;
uniform vec3 cameraPos;
uniform vec3 cameraRot;

#include ./shaders/random.glsl

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

		if(acos(dot(dir,norm))>PI*0.5+atan(sphere.w,length(vector))) continue;

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
		intersectSceneWithMaterial(rayOrigin, newDir, material);
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
		intersectSceneWithMaterial(rayOrigin, rayDirection, material);
		if(material.w>0.5) {
			sum += material.xyz;
		}
	}
	return sum / float(DIRECT_SAMPLES);
}

vec4 resampleScreenBuffer(vec3 pos) {
	vec3 dir = normalize(cameraPos-pos);
	vec2 cameraPlane = cameraPlaneFromRayDir(dir,resolution,vec2(0.0),cameraRot);
	vec3 norm = vec3(0.0);
	vec4 material = vec4(0.0);
	vec3 testPos = vec3(0.0);
	float dist = intersectSceneWithHitpointNormalMaterial(cameraPos, dir, testPos, norm, material);
	if(testPos == pos) {
		return vec4(texture(sampleTexture,cameraPlane*0.5+0.5).xyz,1.0);
	}
	return vec4(0.0);
}

vec3 sampleScene(float seed) {
	vec3 result = vec3(0.0);


	vec3 rayOrigin = cameraPos;
	vec3 rayDirection = rayDirFromCameraPlane(coord.xy,resolution,hash2(seed)-0.5,cameraRot);

	vec3 color = vec3(1.0,1.0,1.0);

	vec3 norm = vec3(0.0);
	vec4 material = vec4(0.0);

	int pathlength = 0;
	while(pathlength<5) {
		pathlength++;

		float dist = intersectSceneWithHitpointNormalMaterial(rayOrigin, rayDirection, rayOrigin, norm, material);
		if(material.w>0.0) {
			#ifdef NEXT_EVENT_ESTIMATION
			if(pathlength>1&&material.w>0.5) break;
			// break;
			#endif
			result += color * material.xyz;
			return result;
		}

		#ifdef RESAMPLE_SCREEN_BUFFER
		if(pathlength>1 RESAMPLE_SCREEN_BUFFER_CONDITION) {
			vec4 resampleResult = resampleScreenBuffer(rayOrigin);
			if(resampleResult.w>0.0) {
					result += color * resampleResult.xyz;
				return result;
			}
		}
		#endif

		color = color * material.xyz;

		float prob = PATH_PROPABILITY_EXPRESSION;

		#ifdef NEXT_EVENT_ESTIMATION
		result += color * nextEventEstimation(rayOrigin,norm,seed);
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
	return result;
}

out vec4 pixel;
void main(void) {
	float seed = coord.x + (coord.y+937.8310762)*coord.y * 3.43993679 + time/294.529562;

	pixel += texture(sampleTexture, coord.xy*0.5+0.5);

	float count = sampleCount-hash1(seed);
	while(pixel.w<count) {
		pixel += vec4(sampleScene(seed),1.0);
	}
}