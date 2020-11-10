vec3 applyPitch(vec3 dir, float a) {
	return vec3(dir.x,dir.y*cos(a)-dir.z*sin(a),dir.z*cos(a)+dir.y*sin(a));
}
vec3 applyYaw(vec3 dir, float a) {
	return vec3(dir.x*cos(a)+dir.y*sin(a),dir.y*cos(a)-dir.x*sin(a),dir.z);
}
vec3 rayDirFromCameraPlane(vec2 coord, vec2 resolution, vec2 offset, vec3 rot) {
	vec2 pixelPos = coord * resolution*0.5 + offset;
	vec2 cameraPlanePos = pixelPos / (resolution.x*0.5);
	vec3 cameraPlaneWorldPos = vec3(cameraPlanePos, -1.0 / tanh(PI*0.5));
	vec3 dir =  normalize(cameraPlaneWorldPos);
	return applyYaw(applyPitch(dir,rot.y),rot.z);
}
vec2 cameraPlaneFromRayDir(vec3 rotDir, vec2 resolution, vec2 offset, vec3 rot) {
	vec3 dir = applyPitch(applyYaw(rotDir,-rot.z),-rot.y);
	vec3 cameraPlaneWorldPos = dir / dir.z * -1.0 / tanh(PI*0.5);
	vec2 cameraPlanePos = cameraPlaneWorldPos.xy;
	vec2 pixelPos = cameraPlanePos * resolution.x*0.5;
	vec2 coord = (pixelPos-offset) / (resolution*0.5);
	return coord;
}