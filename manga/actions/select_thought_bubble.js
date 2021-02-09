import Bubble from "../Bubble.js";

let offsets = [];
let s = 2;
for (let y = -s; y <= s; y++) {
	for (let x = -s; x <= s; x++) {
		offsets.push([x,y]);
	}
}

const select_thought_bubble = (img,x1,y1,x2,y2)=>{
	let affected = [];

	for (let y = y1; y <= y2; y++) {
		for (let x = x1; x <= x2; x++) {
			let i = (x+y*img.width)*4;
			let found = false;
			for(let e of offsets) {
				let p = img.get(x+e[0],y+e[1]);
				if(p[0]<10&&p[1]<10&&p[2]<10) {
					found = true;
					break;
				}
			}
			if(found && img.get(x,y)[0]<200) {
				// img.data[i+0] = img.get(x,y)[0]<10?255:0;
				// img.data[i+1] = 0;
				// img.data[i+2] = 255;
				// img.data[i+3] = 255;
				affected.push([x,y]);
			}
		}
	}
	img.changed();

	if(affected.length<=0) {
		alert("nothing selected");
		throw new Error("");
	}

	let bb = {x:affected[0][0],y:affected[0][1],maxX:affected[0][0],maxY:affected[0][1]};
	for(let e of affected) {
		if(e[0]<bb.x) bb.x = e[0];
		if(e[1]<bb.y) bb.y = e[1];
		if(e[0]>bb.maxX) bb.maxX = e[0];
		if(e[1]>bb.maxY) bb.maxY = e[1];
	}
	bb.width = bb.maxX-bb.x;
	bb.height = bb.maxY-bb.y;

	img.fill(bb.x,bb.y,bb.width,bb.height,255,0,0,255);

	let image = img.slice(bb);

	return new Bubble(bb,image);
};
export default select_thought_bubble;