import { reproject } from "./reproject/reproject.render.js";
import { sample } from "./sample/sample.render.js";
import { filter } from "./filter/filter.render.js";

const getInput = (state)=>{
	let pos = new Float32Array(state.camera.position);
	pos[0] = Math.sin(performance.now()/1000);
	pos[1] = Math.cos(performance.now()/1000);
	return {
		position: pos
	};
};

const render = (canvas, gl, state)=>{
	let start = performance.now();
	
	// get input / new camera
	let newCamera = getInput(state);

	// transform to new camera
	reproject(canvas,gl,state,newCamera);

	// sample
	while(performance.now()-start < 1000/30) {
		sample(canvas, gl, state);
		gl.finish()
		state.sampleCount++;
	}

	// render to screen
	filter(canvas,gl,state);
};
export default render;