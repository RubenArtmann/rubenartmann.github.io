import * as gl_utils from "../gl_utils.js";

export const setup = async(canvas, gl, state)=>{
	let sampleState = {};

	let vertShader = gl_utils.compileShader(gl, gl.VERTEX_SHADER, await gl_utils.downloadAndPreprocessGLSL("./sample/sample.vert.glsl"));

	let fragShader = gl_utils.compileShader(gl, gl.FRAGMENT_SHADER, await gl_utils.downloadAndPreprocessGLSL("./sample/sample.frag.glsl"));

	sampleState.program = gl_utils.createProgram(gl, vertShader, fragShader);
	gl.useProgram(sampleState.program);



	sampleState.coordLoc = gl.getAttribLocation(sampleState.program, "coordinates");
	sampleState.timeLoc = gl.getUniformLocation(sampleState.program, "time");
	
	sampleState.sampleCountLoc = gl.getUniformLocation(sampleState.program, "sampleCount");

	sampleState.sampleTextureLoc = gl.getUniformLocation(sampleState.program, "sampleTexture");

	sampleState.cameraPosLoc = gl.getUniformLocation(sampleState.program, "cameraPos");
	sampleState.cameraRotLoc = gl.getUniformLocation(sampleState.program, "cameraRot");


	state.sampleSwapFrameBuffer = new gl_utils.SwapFrameBuffer(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.uniform2f(gl.getUniformLocation(sampleState.program, "resolution"), gl.drawingBufferWidth, gl.drawingBufferHeight);

	return sampleState;
};