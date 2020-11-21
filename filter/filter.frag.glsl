precision highp float;

uniform sampler2D sampleTexture;
uniform vec2 resolution;
uniform float sampleCount;

#include ./shaders/const.glsl

vec3 clampWithDesaturation(vec3 color) {
	float sat = 1.0;
	float luma = dot(color,vec3(0.299,0.587,0.114));
	for(int i=0; i<3; i++) {
		if(color[i]>1.0) sat = min(sat,(luma-1.0)/(luma-color[i]));
	}
	sat = clamp(sat,0.0,1.0);
	return (color-luma) * sat + luma;
}

void main() {
	vec4 pixel = texture2D(sampleTexture, gl_FragCoord.xy / resolution);
	vec3 color = pixel.xyz / pixel.w;
	color *= BRIGHTNESS;
	color = clampWithDesaturation(color);
	// color.z = pixel.w/10.0;
	gl_FragColor = vec4(color,1.0);
}