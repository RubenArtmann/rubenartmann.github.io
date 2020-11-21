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
