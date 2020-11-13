import * as gl_utils from "../gl_utils.js";

export const setup = async(canvas, gl, state)=>{
	let reprojectState = {};

	let reprojectVertShader = gl_utils.compileShader(gl, gl.VERTEX_SHADER, await gl_utils.downloadAndPreprocessGLSL("./reproject/reproject.vert.glsl"));

	let reprojectFragShader = gl_utils.compileShader(gl, gl.FRAGMENT_SHADER, await gl_utils.downloadAndPreprocessGLSL("./reproject/reproject.frag.glsl"));

	reprojectState.program = gl_utils.createProgram(gl, reprojectVertShader, reprojectFragShader);
	gl.useProgram(reprojectState.program);

	reprojectState.coordLoc = gl.getAttribLocation(reprojectState.program, "coordinates");


	reprojectState.sampleTextureLoc = gl.getUniformLocation(reprojectState.program, "sampleTexture");
	reprojectState.timeLoc = gl.getUniformLocation(reprojectState.program, "time");
	console.log(reprojectState.program,reprojectState.timeLoc)
	reprojectState.oldCameraPosLoc = gl.getUniformLocation(reprojectState.program, "oldCameraPos");
	reprojectState.newCameraPosLoc = gl.getUniformLocation(reprojectState.program, "newCameraPos");
	reprojectState.sampleCountLoc = gl.getUniformLocation(reprojectState.program, "sampleCount");
	reprojectState.resolutionLoc = gl.getUniformLocation(reprojectState.program, "resolution");
	gl.uniform2f(reprojectState.resolutionLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);

	return reprojectState;
};