#version 300 es
precision highp float;

const float infinity = 9999999999.0;

in vec3 coord;
uniform float time;

vec3 hash3(inout float seed) {
	return fract(sin(vec3(seed+=0.1,seed+=0.1,seed+=0.1)*10.0)*vec3(43758.5453123,22578.1459123,19642.3490423));
}

vec3 randSphere(inout float seed) {
	while(true) {
		vec3 p = hash3(seed)*2.0-1.0;
		float lengthSquared = p.x*p.x+p.y*p.y+p.z*p.z;
		if(lengthSquared<=1.0) return p/sqrt(lengthSquared);
	}
}
vec3 randHemiSphere(inout float seed) {
	while(true) {
		vec3 p = hash3(seed)*2.0-1.0;
		p.z = p.z*0.5+0.5;
		float lengthSquared = p.x*p.x+p.y*p.y+p.z*p.z;
		if(lengthSquared<1.0) return p/sqrt(lengthSquared);
	}
}

void createOrthonormalSystem(vec3 v1, inout vec3 v2, inout vec3 v3) {
	v2 = vec3(0.0, 0.0, 1.0);
	v3 = cross(v1,v2);
	v2 = cross(v1,v3);
}
vec3 randHemiSphereAroundNormal(vec3 norm, inout float seed) {
	vec3 sampledDir = randHemiSphere(seed);
	vec3 rotX;
	vec3 rotY;
	createOrthonormalSystem(norm, rotX, rotY);
	vec3 rotatedDir;
	rotatedDir.x = dot(vec3(rotX.x, rotY.x, norm.x),sampledDir);
	rotatedDir.y = dot(vec3(rotX.y, rotY.y, norm.y),sampledDir);
	rotatedDir.z = dot(vec3(rotX.z, rotY.z, norm.z),sampledDir);
	// vec3 hv = normalize(sampledDir+vec3(0.0, 1.0, 0.0));
	// vec4 q = vec4(cross(sampledDir, hv), dot(sampledDir, hv));
	// vec3 rotatedDir = 2.0*(cross(q.xyz, cross(q.xyz, norm) + q.w*norm) + norm);
	return rotatedDir;
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
	if(delta<0.0) return infinity;
	float inv2a = 1.0/(2.0*a);
	if(delta==0.0) {
		float dist = -b*inv2a;
		if(dist<0.0) return infinity;
		return dist;
	}
	float sqrtDelta = sqrt(delta);
	float t1 = (-b+sqrtDelta)*inv2a;
	float t2 = (-b-sqrtDelta)*inv2a;
	float dist = t1>t2?t2:t1;
	if(dist<0.0) return infinity;
	return dist;
}
vec3 normSphere(vec3 point, vec4 sphere) {
	return (point-sphere.xyz)/sphere.w;
}

float intersectScene(vec3 rayOrigin, vec3 rayDirection, inout vec3 hitPoint, inout vec3 norm, inout vec4 material) {
	vec4 spheres[3] = vec4[3](
		vec4(0.0,0.0,1.0, 0.5),
		vec4(0.2,0.4,0.7, 0.1),
		vec4(0.0,2.5,1.0, 2.0)
	);
	vec4 materials[3] = vec4[3](
		vec4(0.7,0.7,0.7,0.0),
		vec4(vec3(1.0)*10.0,1.0),
		vec4(0.0,0.0,1.0,0.0)
	);
	int closest = -1;
	float closestDist = infinity;
	for(int i=0; i<3; i++) {
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
	while(true) {
		float dist = intersectScene(rayOrigin, rayDirection, rayOrigin, norm, material);
		if(dist==infinity) break;
		if(material.w>0.0) {
			pixel = vec4(color * material.xyz,1.0);
			return;
		}
		// cosine importance sampling / cost???
		float cost = dot(-rayDirection,norm);
		color = cost * color * material.xyz;

		float prob = 0.7;

		if(hash3(seed).x>prob) break;
		color = color / prob;

		rayDirection = randHemiSphereAroundNormal(norm,seed);
	}



	pixel = vec4(vec3(0.0),1.0);
}