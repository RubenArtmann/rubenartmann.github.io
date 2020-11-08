import * as gl_utils from "../gl_utils.js";

export const setup = async(canvas, gl, state)=>{

	let filterState = {};

	let filterVertShader = gl_utils.compileShader(gl, gl.VERTEX_SHADER, await (await fetch("./filter/filter.vert.glsl")).text());

	let filterFragShader = gl_utils.compileShader(gl, gl.FRAGMENT_SHADER, await (await fetch("./filter/filter.frag.glsl")).text());
	filterState.program = gl_utils.createProgram(gl, filterVertShader, filterFragShader);
	gl.useProgram(filterState.program);
	filterState.sampleCountLoc = gl.getUniformLocation(filterState.program, "sampleCount");
	gl.uniform2f(gl.getUniformLocation(filterState.program, "resolution"), gl.drawingBufferWidth, gl.drawingBufferHeight);

	return filterState;
};