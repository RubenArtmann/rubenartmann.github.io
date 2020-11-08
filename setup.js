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


	state.sampleCount = 0;

	state.camera = {
		position: new Float32Array([0,0,-5])
	};

	console.log("setup finished");
};

export default setup;