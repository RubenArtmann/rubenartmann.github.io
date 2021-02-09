export const downloadAndPreprocessGLSL = async(path)=>{
	let src = await(await fetch(path)).text();
	let results = src.match(/#include (.+)\r?\n/g);
	if(results === null) return src;
	for (let i = 0; i < results.length; ++i) {
		let subPath = results[i].match(/#include (.+)\r?\n/)[1];
		src = src.replace(results[i], await downloadAndPreprocessGLSL(subPath));
	}
	return src;
};

export const compileShader = (gl, shaderType, src)=>{
	let shader = gl.createShader(shaderType);
	gl.shaderSource(shader,src);
	gl.compileShader(shader)
	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
		let error = gl.getShaderInfoLog(shader);
		let line = parseInt(error.match(/ERROR\: [0-9]+\:([0-9]+)/)[1]);
		console.log(src);
		console.log(src.split("\n")[line-1]);
		throw new Error(error);
	}
	return shader;
};

export const createBuffer = (gl, bufferType, array)=>{
	let buffer = gl.createBuffer();
	gl.bindBuffer(bufferType, buffer);
	gl.bufferData(bufferType, array, gl.STATIC_DRAW);
	gl.bindBuffer(bufferType, null);
	return buffer;
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


let textureUnitCount = 0;
export const createTexture = (gl,textureType, width, height, internalFormat, format, type)=>{
	gl.activeTexture(gl.TEXTURE0 + textureUnitCount);
	let texture = gl.createTexture();
	texture.textureUnit = textureUnitCount;
	
	gl.bindTexture(textureType, texture);
	gl.texImage2D(textureType, 0, internalFormat, width, height, 0, format, type, null);
	
	gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	textureUnitCount++;

	return texture;
};





export class SwapFrameBuffer {
	constructor(gl, width, height) {
		this.gl = gl;

		this.front = {};
		this.front.frameBuffer = gl.createFramebuffer();
		this.back = {};
		this.back.frameBuffer = gl.createFramebuffer();

		this.resize(width,height);
	}
	resize(width, height) {
		const gl = this.gl;

		this.width = width;
		this.height = height;

		this.front.frameBufferTexture = createTexture(gl, gl.TEXTURE_2D, width, height, gl.RGBA32F, gl.RGBA, gl.FLOAT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.front.frameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.front.frameBufferTexture, 0);

		this.back.frameBufferTexture = createTexture(gl, gl.TEXTURE_2D, width, height, gl.RGBA32F, gl.RGBA, gl.FLOAT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.back.frameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.back.frameBufferTexture, 0);
	}
	swap() {
		let temp = this.front;
		this.front = this.back;
		this.back = temp;
	}
}