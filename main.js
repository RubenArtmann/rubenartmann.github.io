import setup from "./setup.js";
import render from "./render.js";

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");
window.gl = gl;

let state = {};


const draw = ()=>{
	// c.clearRect(0,0,canvas.width,canvas.height);
	let start = performance.now();
	render(canvas, gl, state);

	let deltaTime = performance.now() - start;
	document.querySelector("#deltaTime").innerHTML = deltaTime;
	window.requestAnimationFrame(draw);
};
const resize = ()=>{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
window.addEventListener("resize",resize);
resize();
setup(canvas, gl, state).then(draw);