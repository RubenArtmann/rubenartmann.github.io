export const reproject = (canvas, gl, state, newCamera)=>{
	if(JSON.stringify(state.camera) !== JSON.stringify(newCamera)) {
		// gl.useProgram(state.sample.program);
		// gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleSwapFrameBuffer.front.frameBuffer);

		// gl.clearColor(0, 0, 0, 0);
		// gl.clear(gl.COLOR_BUFFER_BIT);
		// state.sampleCount = 0;


		gl.useProgram(state.reproject.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleSwapFrameBuffer.back.frameBuffer);

		gl.uniform1i(state.reproject.sampleTextureLoc, state.sampleSwapFrameBuffer.front.frameBufferTexture.textureUnit);


		gl.disable(gl.BLEND);
		// gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		// state.sampleCount = 0;


		gl.uniform3f(state.reproject.oldCameraPosLoc, ...state.camera.position);
		gl.uniform3f(state.reproject.newCameraPosLoc, ...newCamera.position);
		gl.uniform3f(state.reproject.oldCameraRotLoc, ...state.camera.rotation);
		gl.uniform3f(state.reproject.newCameraRotLoc, ...newCamera.rotation);
		gl.uniform1f(state.reproject.timeLoc, performance.now());
		gl.uniform1f(state.reproject.sampleCountLoc, state.sampleCount);
		gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);

		state.sampleSwapFrameBuffer.swap();

		if(state.sampleCount>2) state.sampleCount = 2;
	}

	state.camera = newCamera;
};