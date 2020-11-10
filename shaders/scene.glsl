


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

#define LIGHT_COUNT 3
vec4 lights[LIGHT_COUNT] = vec4[LIGHT_COUNT](
	vec4(50.0,50.0,100.0, 3.0),//sun
	vec4(-0.4,-0.8,-0.3, 0.3),
	vec4(0.2,0.4,0.3, 0.1)
);
#define SPHERE_COUNT 8
vec4 spheres[SPHERE_COUNT] = vec4[SPHERE_COUNT](
	vec4(50.0,50.0,100.0, 3.0),//sun
	vec4(-0.4,-0.8,-0.3, 0.3),
	vec4(0.2,0.4,0.3, 0.1),
	vec4(0.0,0.0,0.0, 0.5),
	vec4(-2.5,0.0,0.0, 2.0),//left
	vec4(0.0,2.5,0.0, 2.0),//up
	vec4(2.5,0.0,0.0, 2.0),//right
	vec4(0.0,0.0,-10.5, 10.0)//,//bottom
	// vec4(0.0,0.0,-11.0, 10.0)//top
);
vec4 materials[SPHERE_COUNT] = vec4[SPHERE_COUNT](
	vec4(vec3(1.0,1.0,0.5)*1000.0,1.0),//sun
	vec4(vec3(1.0,1.0,2.0)*8.0,1.0),
	vec4(vec3(1.0)*3.0,1.0),
	vec4(1.0,1.0,1.0,0.0),
	vec4(1.0,0.5,0.5,0.0),//left
	vec4(0.5,1.0,0.5,0.0),//up
	vec4(0.5,0.5,1.0,0.0),//right
	vec4(1.0,1.0,1.0,0.0)//,//bottom
	// vec4(1.0,1.0,1.0,0.0)//top
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
			hitPoint = rayOrigin + rayDirection*(closestDist-EPSILON);
			norm = normSphere(hitPoint, spheres[i]);
		}
	}
	if(closest<0) {
		norm = vec3(0.0);
		material = vec4(AMBIENT_LIGHT,0.3);
		return closestDist;
	}
	return closestDist;
}