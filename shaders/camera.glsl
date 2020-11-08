vec3 rayDirFromCameraPlane(vec3 coord, vec2 resolution, vec2 offset) {
	vec2 pixelPos = coord.xy * resolution*0.5 + offset;
	vec2 cameraPlanePos = pixelPos / (resolution.x*0.5);
	vec3 cameraPlaneWorldPos = vec3(cameraPlanePos, 1.0 / tanh(PI*0.5));
	return normalize(cameraPlaneWorldPos);
}
vec2 cameraPlaneFromRayDir(vec3 dir, vec2 resolution, vec2 offset) {
	vec3 cameraPlaneWorldPos = dir / dir.z / tanh(PI*0.5);
	vec2 cameraPlanePos = cameraPlaneWorldPos.xy;
	vec2 pixelPos = cameraPlanePos * resolution.x*0.5;
	vec2 coord = (pixelPos-offset) / (resolution*0.5);
	return coord;
}


	// vec2 pixelPos = coord.xy * resolution*0.5 + offset;
	// vec2 cameraPlanePos = pixelPos / (resolution.x*0.5);
	// vec3 cameraPlaneWorldPos = vec3(cameraPlanePos, 1.0 / tanh(PI*0.5));
	// return normalize(cameraPlaneWorldPos);

	// vec3 cameraPlaneWorldPos = dir / dir.z * 1.0 / tanh(PI*0.5);
	// vec2 cameraPlanePos = cameraPlaneWorldPos.xy;
	// vec2 pixelPos = cameraPlanePos * resolution.x*0.5;
	// vec2 coord = (pixelPos-offset) / (resolution*0.5);
	// return coord;