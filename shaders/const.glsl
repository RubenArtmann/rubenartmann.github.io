//settings
#define PATH_PROPABILITY_EXPRESSION pathlength<=3?1.0:1.0/float(pathlength)
#define NEXT_EVENT_ESTIMATION
#define ENABLE_HACKED_NEXT_EVENT_ESTIMATION
#define DIRECT_SAMPLES 4

#define AMBIENT_LIGHT vec3(0.5,0.5,0.3)*0.3


//constants
const float INFINITY = 9999999999.0;
const float EPSILON = 0.0001;
const float PI = 3.141592653589793;
const float TAU = 2.0*PI;