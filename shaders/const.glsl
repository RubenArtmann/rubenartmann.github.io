//settings
#define PATH_PROPABILITY_EXPRESSION pathlength<=3?1.0:0.3

#define NEXT_EVENT_ESTIMATION
#define ENABLE_HACKED_NEXT_EVENT_ESTIMATION
const int DIRECT_SAMPLES = 4;

const float REPROJECTION_WEIGHT_FALLOFF = 0.9;
const float REPROJECTION_DISCARD_RADIUS = 1.5;
const int REPROJECTION_DISCARD_SAMPLE_COUNT = 3;

const vec3 AMBIENT_LIGHT = vec3(0.8,1.0,1.0)*0.1;

const float BRIGHTNESS = 1.0;


//constants
const float INFINITY = 9999999999.0;
const float EPSILON = 0.00001;
const float PI = 3.141592653589793;
const float TAU = 2.0*PI;