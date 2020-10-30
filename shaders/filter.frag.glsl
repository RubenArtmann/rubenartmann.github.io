precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;
uniform float sampleCount;

vec3 clampWithDesaturation(vec3 color) {
	float sat = 1.0;
	float luma = dot(color,vec3(0.299,0.587,0.114));
	for(int i=0; i<3; i++) {
		if(color[i]>1.0) sat = min(sat,(luma-1.0)/(luma-color[i]));
	}
	sat = min(1.0,max(sat,0.0));
	return (color-luma) * sat + luma;
}

void main() {
	vec3 color = texture2D(texture, gl_FragCoord.xy / resolution).xyz / sampleCount;
	gl_FragColor = vec4(clampWithDesaturation(color),1.0);
}