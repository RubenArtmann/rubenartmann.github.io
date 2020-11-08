export const createBuffer = (gl, bufferType, array)=>{
	let buffer = gl.createBuffer();
	gl.bindBuffer(bufferType, buffer);
	gl.bufferData(bufferType, array, gl.STATIC_DRAW);
	gl.bindBuffer(bufferType, null);
	return buffer;
};

export const compileShader = (gl, shaderType, src)=>{
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

export const createProgram = (gl, vertShader, fragShader)=>{
	let program = gl.createProgram();
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program,gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program));
	}
	return program;
};



export const createTexture = (gl,textureType, width, height, internalFormat, format, type)=>{
	let texture = gl.createTexture();
	
	gl.bindTexture(textureType, texture);
	gl.texImage2D(textureType, 0, internalFormat, width, height, 0, format, type, null);
	
	gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
};