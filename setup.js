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

const setup = async(canvas, gl, state)=>{
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

	let vertShader = compileShader(gl, gl.VERTEX_SHADER, await (await fetch("./shader.vert.glsl")).text());

	let fragShader = compileShader(gl, gl.FRAGMENT_SHADER, await (await fetch("./shader.frag.glsl")).text());

	let shaderProgram = createProgram(gl, vertShader, fragShader);
	gl.useProgram(shaderProgram);

	/*======= Associating shaders to buffer objects =======*/

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	let coord = gl.getAttribLocation(shaderProgram, "coordinates");

	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0); 

	gl.enableVertexAttribArray(coord);



	state.time = gl.getUniformLocation(shaderProgram, "time");
};

export default setup;