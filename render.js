const sample = (canvas, gl, state)=>{
	gl.useProgram(state.samplerProgram);
	gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleFramebuffer);

	// gl.clearColor(0,0,0, 1);

	// gl.clear(gl.COLOR_BUFFER_BIT);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);


	gl.uniform1f(state.timeLoc, performance.now());

	gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);
};
const render = (canvas, gl, state)=>{
	let start = performance.now();
	while(performance.now()-start < 1) {
		sample(canvas, gl, state);
		state.sampleCount++;
	}

	gl.useProgram(state.filterProgram);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null/*drawing buffer*/);

	gl.bindTexture(gl.TEXTURE_2D, state.sampleTexture);

	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.BLEND);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


	gl.uniform1f(state.sampleCountLoc, state.sampleCount);


	gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);
};
export default render;