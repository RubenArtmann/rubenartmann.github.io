export const sample = (canvas, gl, state)=>{
	// gl.useProgram(state.sample.program);
	// gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleSwapFrameBuffer.front.frameBuffer);

	// // gl.clearColor(0,0,0, 1);

	// // gl.clear(gl.COLOR_BUFFER_BIT);

	// gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// gl.enable(gl.BLEND);
	// gl.blendFunc(gl.ONE, gl.ONE);


	// gl.uniform3f(state.sample.cameraPosLoc, ...state.camera.position);
	// gl.uniform3f(state.sample.cameraRotLoc, ...state.camera.rotation);
	// gl.uniform1f(state.sample.timeLoc, performance.now());

	// gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);


	


	gl.useProgram(state.sample.program);
	gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleSwapFrameBuffer.back.frameBuffer);

	gl.uniform1i(state.sample.sampleTextureLoc, state.sampleSwapFrameBuffer.front.frameBufferTexture.textureUnit);


	gl.disable(gl.BLEND);
	// gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	// state.sampleCount = 0;


	gl.uniform3f(state.sample.cameraPosLoc, ...state.camera.position);
	gl.uniform3f(state.sample.cameraRotLoc, ...state.camera.rotation);
	gl.uniform1f(state.sample.timeLoc, performance.now());
	gl.uniform1f(state.sample.sampleCountLoc, state.sampleCount);
	gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);

	state.sampleSwapFrameBuffer.swap();
};