#version 300 es
precision highp float;

//settings
#define NEXT_EVENT_ESTIMATION

const float INFINITY = 9999999999.0;
const float PI = 3.141592653589793;
const float TAU = 6.28318530718;

in vec3 coord;
uniform float time;

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
	float sign = sign(n.z);
	float a = -1.0 / (sign + n.z);
	float b = n.x*n.y*a;
	b1 = vec3(1.0 + sign*n.x*n.x*a, sign*b, -sign*n.x);
	b2 = vec3(b, sign + n.y*n.y*a, -n.y);
}

// from https://github.com/FoxelFox/voxel-octree/blob/master/src/render/pipeline/v2/node/rt-chunk-node/rt-chunk-node.fs.glsl
vec3 cosWeightedRandomHemisphereDirection( const vec3 n, inout float seed ) {
	vec2 r = hash2(seed);
	// vec3  uu = normalize(cross(n, abs(n.y) > .5 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
	// vec3  vv = cross(uu, n);
	vec3 uu, vv;
	branchlessONB(n,uu,vv);
	float ra = sqrt(r.y);
	float rx = ra*cos(TAU*r.x);
	float ry = ra*sin(TAU*r.x);
	float rz = sqrt(1.-r.y);
	vec3  rr = vec3(rx*uu + ry*vv + rz*n);
	return normalize(rr);
}


float intersectSphere(vec3 rayOrigin, vec3 rayDirection, vec4 sphere) {
	// p² = r
	// p = o+t*d
	// (o+t*d)² = r
	// o² + 2*o*d*t + (t*d)² = r
	// d²*t² + 2*o*d*t + o²-r = 0

	vec3 o = rayOrigin - sphere.xyz;

	// a = d²
	float a = dot(rayDirection,rayDirection);
	// b = 2*o*d
	float b = 2.0*dot(o,rayDirection);
	// c = o²-r
	float c = dot(o,o)-sphere.w*sphere.w;

	// delta = b² - 4ac
	float delta = b*b - 4.0*a*c;
	// t = (-b+-sqrt(delta))/2a
	if(delta<0.0) return INFINITY;
	float inv2a = 1.0/(2.0*a);
	if(delta==0.0) {
		float dist = -b*inv2a;
		if(dist<0.0) return INFINITY;
		return dist;
	}
	float sqrtDelta = sqrt(delta);
	float t1 = (-b+sqrtDelta)*inv2a;
	float t2 = (-b-sqrtDelta)*inv2a;
	float dist = t1>t2?t2:t1;
	if(dist<0.0) return INFINITY;
	return dist;
}
vec3 normSphere(vec3 point, vec4 sphere) {
	return (point-sphere.xyz)/sphere.w;
}

#define LIGHT_COUNT 2
vec4 lights[LIGHT_COUNT] = vec4[LIGHT_COUNT](
	vec4(0.2,0.4,-0.3, 0.1),
	vec4(-0.4,-0.2,-0.3, 0.1)
);
#define SPHERE_COUNT 8
vec4 spheres[SPHERE_COUNT] = vec4[SPHERE_COUNT](
	vec4(0.0,0.0,0.0, 0.5),
	vec4(0.2,0.4,-0.3, 0.1),
	vec4(-0.4,-0.2,0.3, 0.1),
	vec4(-2.5,0.0,0.0, 2.0),//left
	vec4(0.0,2.5,0.0, 2.0),//up
	vec4(2.5,0.0,0.0, 2.0),//right
	vec4(0.0,0.0,10.5, 10.0),//bottom
	vec4(0.0,0.0,-11.0, 10.0)//top
);
vec4 materials[SPHERE_COUNT] = vec4[SPHERE_COUNT](
	vec4(1.0,1.0,1.0,0.0),
	vec4(vec3(1.0)*3.0,1.0),
	vec4(vec3(1.0,1.0,2.0)*15.0,1.0),
	vec4(1.0,0.1,0.1,0.0),//left
	vec4(0.1,1.0,0.1,0.0),//up
	vec4(0.1,0.1,1.0,0.0),//right
	vec4(1.0,1.0,1.0,0.0),//bottom
	vec4(1.0,1.0,1.0,0.0)//top
);

float intersectScene(vec3 rayOrigin, vec3 rayDirection, inout vec3 hitPoint, inout vec3 norm, inout vec4 material) {
	int closest = -1;
	float closestDist = INFINITY;
	for(int i=0; i<SPHERE_COUNT; i++) {
		float dist = intersectSphere(rayOrigin, rayDirection, spheres[i]);
		if(dist<closestDist) {
			closest = i;
			closestDist = dist;
			material = materials[i];
		}
	}
	if(closest<0) {
		norm = vec3(0.0);
		material = vec4(0.0,0.0,0.0,0.0);
		return closestDist;
	}
	hitPoint = rayOrigin + rayDirection*(closestDist-0.0001);
	norm = normSphere(hitPoint, spheres[closest]);
	return closestDist;
}

out vec4 pixel;
void main(void) {
	float seed = coord.x + coord.y * 3.43121412313 + time/294.529562;

	vec3 rayOrigin = vec3(coord.xy, -10.0);
	vec3 rayDirection = vec3(0.0, 0.0, 1.0);

	vec3 color = vec3(1.0);

	vec3 hitPoint;
	vec3 norm;
	vec4 material;

	int pathlength = 0;
	while(true) {
		pathlength++;

		float dist = intersectScene(rayOrigin, rayDirection, rayOrigin, norm, material);
		if(dist==INFINITY) break;
		if(material.w>0.5) {
			#ifdef NEXT_EVENT_ESTIMATION
			break;
			#endif
			pixel = vec4(color * material.xyz,1.0);
			return;
		}
		color = color * material.xyz;

		float prob = pathlength<=5?0.5:0.1;

		if(hash1(seed)>prob) {
			#ifndef NEXT_EVENT_ESTIMATION
			break;
			#endif
			color = color / (1.0-prob);
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
				intersectScene(rayOrigin, newDir, scratch, scratch, material);
				//assume no overlap between lights
				if(material.w>0.5) {
					float cost = dot(newDir,norm);
					if(cost>0.0) {
						light += material.xyz * areaFraction * 2.0 * cost * PI;
					}
				}
			}

			pixel = vec4(color * light / float(LIGHT_COUNT),1.0);
			return;
		}
		color = color / prob;

		rayDirection = cosWeightedRandomHemisphereDirection(norm,seed);
	}



	pixel = vec4(vec3(0.0),1.0);
}