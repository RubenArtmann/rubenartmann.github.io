import * as gl_utils from "../gl_utils.js";

export const setup = async(canvas, gl, state)=>{
	let reprojectState = {};

	let reprojectVertShader = gl_utils.compileShader(gl, gl.VERTEX_SHADER, await (await fetch("./reproject/reproject.vert.glsl")).text());

	let reprojectFragShader = gl_utils.compileShader(gl, gl.FRAGMENT_SHADER, await (await fetch("./reproject/reproject.frag.glsl")).text());

	reprojectState.program = gl_utils.createProgram(gl, reprojectVertShader, reprojectFragShader);
	gl.useProgram(reprojectState.program);

	// gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	reprojectState.coordLoc = gl.getAttribLocation(reprojectState.program, "coordinates");

	// gl.vertexAttribPointer(reprojectState.coordLoc, 3, gl.FLOAT, false, 0, 0); 

	// gl.enableVertexAttribArray(reprojectState.coordLoc);


	reprojectState.resolutionLoc = gl.getUniformLocation(reprojectState.program, "resolution");
	gl.uniform2f(reprojectState.resolutionLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);
	reprojectState.timeLoc = gl.getUniformLocation(reprojectState.program, "time");
	reprojectState.oldCameraPosLoc = gl.getUniformLocation(reprojectState.program, "oldCameraPos");
	reprojectState.newCameraPosLoc = gl.getUniformLocation(reprojectState.program, "newCameraPos");
	reprojectState.sampleCountLoc = gl.getUniformLocation(reprojectState.program, "sampleCount");

	return reprojectState;
};