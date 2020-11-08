export const filter = (canvas, gl, state)=>{
	gl.useProgram(state.filter.program);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null/*drawing buffer*/);

	gl.uniform1i(state.filter.sampleTextureLoc, state.sampleSwapFrameBuffer.front.frameBufferTexture.textureUnit);

	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.disable(gl.BLEND);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


	gl.uniform1f(state.filter.sampleCountLoc, state.sampleCount);


	gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);
};