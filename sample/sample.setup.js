import * as gl_utils from "../gl_utils.js";

export const setup = async(canvas, gl, state)=>{
	let vertices = [
		-1.0, 1.0, 0.0,
		 1.0,-1.0, 0.0,
		-1.0,-1.0, 0.0,
		 1.0, 1.0, 0.0
	];

	state.indices = [0,1,2,1,0,3];

	let vertex_buffer = gl_utils.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices));

	let index_buffer = gl_utils.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(state.indices));





	let sampleState = {};

	let vertShader = gl_utils.compileShader(gl, gl.VERTEX_SHADER, await (await fetch("./sample/sample.vert.glsl")).text());

	let fragShader = gl_utils.compileShader(gl, gl.FRAGMENT_SHADER, await (await fetch("./sample/sample.frag.glsl")).text());

	sampleState.program = gl_utils.createProgram(gl, vertShader, fragShader);
	gl.useProgram(sampleState.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	sampleState.coordLoc = gl.getAttribLocation(sampleState.program, "coordinates");

	gl.vertexAttribPointer(sampleState.coordLoc, 3, gl.FLOAT, false, 0, 0); 

	gl.enableVertexAttribArray(sampleState.coordLoc);


	sampleState.timeLoc = gl.getUniformLocation(sampleState.program, "time");
	sampleState.cameraPosLoc = gl.getUniformLocation(sampleState.program, "cameraPos");


	state.sampleFramebuffer = gl.createFramebuffer();

	state.sampleTexture = gl_utils.createTexture(gl, gl.TEXTURE_2D, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA32F, gl.RGBA, gl.FLOAT)

	gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, state.sampleTexture, 0);
	gl.uniform2f(gl.getUniformLocation(sampleState.program, "resolution"), gl.drawingBufferWidth, gl.drawingBufferHeight);

	return sampleState;
};