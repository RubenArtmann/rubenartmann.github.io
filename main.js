import setup from "./setup.js";
import render from "./render.js";

// const sample = (x)=>Math.sin(x);
// const integrate = (sampler,begin,end,sampleCount)=>{
// 	let acc = 0;
// 	for (let i = 0; i < sampleCount; i++) {
// 		acc += sampler(Math.random()*(end-begin)+begin);
// 	}
// 	return acc/sampleCount * (end-begin);
// };
// const approximateDistribution = (sampler,begin,end,sampleCount,depth=3)=>{
// 	const findMiddle = (samples)=>{
// 		if(samples.length<1) throw new Error();
// 		samples.sort();
// 		let left = 0;
// 		let leftIndex = 0;
// 		let right = 0;
// 		let rightIndex = samples.length-1;
// 		while(leftIndex<rightIndex) {
// 			if(left<right) {
// 				left += samples[leftIndex];
// 				leftIndex++;
// 			}  else  {
// 				right += samples[rightIndex];
// 				rightIndex--;
// 			}
// 		}
// 		return left<right?leftIndex:rightIndex;
// 	};
// 	const buildTree = (samples,depth)=>{
// 		if(depth<=0) return null;
// 		// samples.sort();
// 		// let middleIndex = Math.floor(samples.length/2);
// 		let middleIndex = findMiddle(samples);
// 		return {
// 			middle: samples[middleIndex],
// 			left: buildTree(samples.slice(0,middleIndex),depth-1),
// 			right: buildTree(samples.slice(middleIndex+1,-1),depth-1)
// 		};
// 	};
// 	let samples = [];
// 	for (let i = 0; i < sampleCount; i++) {
// 		samples.push(sampler(Math.random()*(end-begin)+begin));
// 	}
// 	let tree = buildTree(samples,depth);
// 	tree.depth = depth;
// 	console.log(tree);
// 	return tree;
// };
// const sampleWithDistribution = (treeInput,sampler)=>{
// 	return ()=>{
// 		let tree = treeInput;
// 		let depth = tree.depth;
// 		let begin = 0;
// 		let end = 1;
// 		let prop = 1;
// 		for (let i = 0; i < depth; i++) {
// 			prop *= 0.5;
// 			if(Math.random()<0.5) {
// 				end = tree.middle;
// 				tree = tree.left;
// 			}  else  {
// 				begin = tree.middle;
// 				tree = tree.right;
// 			}
// 		}
// 		let area = end-begin;
// 		if(area==0) throw new Error("");
// 		return sampler(Math.random()*(end-begin)+begin)/prop*area;
// 	};
// };
// const standartAbweichung = (sampler,sampleCount)=>{
// 	let samples = [];
// 	let average = 0;
// 	for (let i = 0; i < sampleCount; i++) {
// 		let value = sampler();
// 		average += value;
// 		samples.push(value);
// 	}
// 	average /= sampleCount;

// 	let acc = 0;
// 	for (let i = 0; i < samples.length; i++) {
// 		acc += Math.pow(average-samples[i],2);
// 	}
// 	console.log(samples);
// 	return Math.pow(acc/sampleCount,0.5);
// };
// console.log(integrate(sample,0,1,1000));
// console.log(integrate(sampleWithDistribution(approximateDistribution(sample,0,1,1000,5),sample),0,1,1000));
// console.log(standartAbweichung(()=>integrate(sample,0,1,1000),1000))
// let distribution = approximateDistribution(sample,0,1,100000,10);
// console.log(standartAbweichung(()=>integrate(sampleWithDistribution(distribution,sample),0,1,1000),1000))

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");
window.gl = gl;

let state = {};
window.state = state;


const draw = ()=>{
	// c.clearRect(0,0,canvas.width,canvas.height);
	let start = performance.now();
	render(canvas, gl, state);

	let deltaTime = performance.now() - start;
	document.querySelector("#deltaTime").innerHTML = deltaTime;
	document.querySelector("#spp").innerHTML = state.sampleCount;
	window.requestAnimationFrame(draw);
};
const resize = ()=>{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
window.addEventListener("resize",resize);
resize();
setup(canvas, gl, state).then(draw);