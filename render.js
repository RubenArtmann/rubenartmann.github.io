import { reproject } from "./reproject/reproject.render.js";
import { sample } from "./sample/sample.render.js";
import { filter } from "./filter/filter.render.js";

let keyboard = new Map();
window.keyboard = keyboard;
window.addEventListener("keydown",(e)=>{
	keyboard.set(e.code,true);
});
window.addEventListener("keyup",(e)=>{
	keyboard.set(e.code,false);
});

const getInput = (state,lastDeltaTime)=>{
	let pos = new Float32Array(state.camera.position);
	let rot = new Float32Array(state.camera.rotation);
	// pos[0] = Math.sin(performance.now()/1000);
	// pos[1] = Math.cos(performance.now()/1000);
	let dt = lastDeltaTime/1000;
	let distance = dt*2;
	let angleDistance = dt;
	if(keyboard.get("ArrowUp")) rot[1]+=angleDistance;
	if(keyboard.get("ArrowDown")) rot[1]-=angleDistance;
	if(keyboard.get("ArrowRight")) rot[2]+=angleDistance;
	if(keyboard.get("ArrowLeft")) rot[2]-=angleDistance;

	let a = rot[2];

	if(keyboard.get("KeyW")) {
		pos[1]+=distance*Math.cos(a);
		pos[0]+=distance*Math.sin(a);
	}
	if(keyboard.get("KeyS")) {
		pos[1]-=distance*Math.cos(a);
		pos[0]-=distance*Math.sin(a);
	}
	if(keyboard.get("KeyA")) {
		pos[0]-=distance*Math.cos(a);
		pos[1]-=distance*-Math.sin(a);
	}
	if(keyboard.get("KeyD")) {
		pos[0]+=distance*Math.cos(a);
		pos[1]+=distance*-Math.sin(a);
	}
	if(keyboard.get("ShiftLeft")) pos[2]-=distance;
	if(keyboard.get("Space")) pos[2]+=distance;

	return {
		position: pos,
		rotation: rot
	};
};

let lastDeltaTime = 1000/30;
const render = (canvas, gl, state)=>{
	let start = performance.now();

	// get input / new camera
	let newCamera = getInput(state,lastDeltaTime);

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
	lastDeltaTime = performance.now()-start;
};
export default render;