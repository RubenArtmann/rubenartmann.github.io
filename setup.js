import * as gl_utils from "./gl_utils.js";

import { setup as setupSample } from "./sample/sample.setup.js";
import { setup as setupReproject } from "./reproject/reproject.setup.js";
import { setup as setupFilter } from "./filter/filter.setup.js";



const setup = async(canvas, gl, state)=>{
	gl.getExtension("EXT_color_buffer_float");
	gl.getExtension("EXT_float_blend");


	state.sample = await setupSample(canvas, gl, state);
	state.reproject = await setupReproject(canvas, gl, state);
	state.filter = await setupFilter(canvas, gl, state);


	let vertices = [
		-1.0, 1.0, 0.0,
		 1.0,-1.0, 0.0,
		-1.0,-1.0, 0.0,
		 1.0, 1.0, 0.0
	];

	state.indices = [0,1,2,1,0,3];

	let vertex_buffer = gl_utils.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices));

	let index_buffer = gl_utils.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(state.indices));

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	gl.vertexAttribPointer(state.sample.coordLoc, 3, gl.FLOAT, false, 0, 0); 

	gl.enableVertexAttribArray(state.sample.coordLoc);


	state.sampleCount = 0;

	state.camera = {
		position: new Float32Array([0,0,-5])
	};

	console.log("setup finished",state);
};

export default setup;