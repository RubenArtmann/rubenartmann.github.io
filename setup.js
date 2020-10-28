const createBuffer = (gl, bufferType, array)=>{
	let buffer = gl.createBuffer();
	gl.bindBuffer(bufferType, buffer);
	gl.bufferData(bufferType, array, gl.STATIC_DRAW);
	gl.bindBuffer(bufferType, null);
	return buffer;
};

const compileShader = (gl, shaderType, src)=>{
	let shader = gl.createShader(shaderType);
	gl.shaderSource(shader,src);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
		let error = gl.getShaderInfoLog(shader);
		let line = parseInt(error.match(/ERROR\: [0-9]+\:([0-9]+)/)[1]);
		console.log(src);
		console.log(src.split("\n")[line-1]);
		throw new Error(error);
	}
	return shader;
};

const createProgram = (gl, vertShader, fragShader)=>{
	let program = gl.createProgram();
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program,gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program));
	}
	return program;
};



const createTexture = (gl,textureType, width, height, internalFormat, format, type)=>{
	let texture = gl.createTexture();
	
	gl.bindTexture(textureType, texture);
	gl.texImage2D(textureType, 0, internalFormat, width, height, 0, format, type, null);
	
	gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
};

const setup = async(canvas, gl, state)=>{
	gl.getExtension("EXT_float_blend");
	gl.getExtension("EXT_color_buffer_float");



	let vertices = [
		-1.0, 1.0, 0.0,
		 1.0,-1.0, 0.0,
		-1.0,-1.0, 0.0,
		 1.0, 1.0, 0.0
	];

	state.indices = [0,1,2,1,0,3];

	let vertex_buffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices));

	let index_buffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(state.indices ));

	/*================ Shaders ====================*/

	let vertShader = compileShader(gl, gl.VERTEX_SHADER, await (await fetch("./shaders/sampler.vert.glsl")).text());

	let fragShader = compileShader(gl, gl.FRAGMENT_SHADER, await (await fetch("./shaders/sampler.frag.glsl")).text());

	state.samplerProgram = createProgram(gl, vertShader, fragShader);
	gl.useProgram(state.samplerProgram);

	/*======= Associating shaders to buffer objects =======*/

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	let coord = gl.getAttribLocation(state.samplerProgram, "coordinates");

	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0); 

	gl.enableVertexAttribArray(coord);


	state.timeLoc = gl.getUniformLocation(state.samplerProgram, "time");



	state.sampleFramebuffer = gl.createFramebuffer();

	state.sampleTexture = createTexture(gl, gl.TEXTURE_2D, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA32F, gl.RGBA, gl.FLOAT)

	gl.bindFramebuffer(gl.FRAMEBUFFER, state.sampleFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, state.sampleTexture, 0);



	let filterVertShader = compileShader(gl, gl.VERTEX_SHADER, await (await fetch("./shaders/filter.vert.glsl")).text());

	let filterFragShader = compileShader(gl, gl.FRAGMENT_SHADER, await (await fetch("./shaders/filter.frag.glsl")).text());
	state.filterProgram = createProgram(gl, filterVertShader, filterFragShader);
	gl.useProgram(state.filterProgram);
	state.sampleCountLoc = gl.getUniformLocation(state.filterProgram, "sampleCount");
	gl.uniform2f(gl.getUniformLocation(state.filterProgram, "resolution"), canvas.width, canvas.height);



	state.sampleCount = 0;

	console.log("setup finished");
};

export default setup;