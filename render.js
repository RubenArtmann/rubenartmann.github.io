const render = (canvas, gl, state)=>{
	gl.clearColor(1, 1, 1, 1);

	gl.enable(gl.DEPTH_TEST);

	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	gl.uniform1f(state.time, performance.now());

	gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT,0);};
export default render;