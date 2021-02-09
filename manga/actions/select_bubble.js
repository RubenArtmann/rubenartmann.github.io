import Bubble from "../Bubble.js";

const select_bubble = (img,x,y)=>{
	let originalY = y;
	const check = (x,y)=>{
		// for (let y2 = y-2; y2 <= y+2; y2++) {
		// 	for (let x2 = x-2; x2 <= x+2; x2++) {
		// 		let r = img.get(x2,y2)[0];
		// 		if(r<240&&r>10) return false;
		// 	}
		// }
		// return true;
		if(x<0||x>=img.width||y<0||y>=img.height) return false
		return img.get(x,y)[0]>230
	};

	while(check(x,y-1)) y--;
	img.fill(x,y,x,y,255,0,0,255);

	let affected = [];

	let dir = 1;
	for (let i = 0; i < 100000; i++) {
		affected.push([x,y]);
		switch(dir) {
			case 0:
				if(check(x-1,y)) {
					dir = 3;
					x--;
				}  else  if(check(x,y-1)) {
					y--;
				}  else  {
					dir++;
				}
			break;
			case 1:
				if(check(x,y-1)) {
					dir--;
					y--;
				}  else  if(check(x+1,y)) {
					x++;
				}  else  {
					dir++;
				}
			break;
			case 2:
				if(check(x+1,y)) {
					dir--;
					x++;
				}  else  if(check(x,y+1)) {
					y++;
				}  else  {
					dir++;
				}
			break;
			case 3:
				if(check(x,y+1)) {
					dir--;
					y++
				}  else  if(check(x-1,y)) {
					x--;
				}  else  {
					dir = 0;
				}
			break;
		}
		if(affected[0][0]===x&&affected[0][1]===y&&affected.length>1) break;
		img.fill(x,y,x,y,255,255,0,255);
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

	console.log(bb);
	if(bb.width<10||bb.height<10) {
		alert("bubble to small");
		throw new Error("");
	}

	//flood fill
	let border = [[x-bb.x,originalY-bb.y]];
	let filled = new Uint8Array(bb.width*bb.height);
	for(let e of affected) {
		filled[e[0]-bb.x+(e[1]-bb.y)*bb.width] = 1;
	}
	const add = (x,y)=>{
		let i = x+y*bb.width;
		if(x<0||x>=bb.width||y<0||y>=bb.height) return;
		if(filled[i]>0) return;
		filled[i] = 1;
		filled[i] = 1;
		border.push([x,y]);
	};
	let i = 0;
	while(border.length>0 && i<1000000) {
		let a = border.pop();
		add(a[0],a[1]-1);
		add(a[0],a[1]+1);
		add(a[0]-1,a[1]);
		add(a[0]+1,a[1]);
		i++;
	}

	let image = img.slice(bb);

	for (let y = 0; y < image.height; y++) {
		for (let x = 0; x < image.width; x++) {
			let i = (x+y*image.width)*4;
			if(filled[x+y*bb.width]>0) continue;
			image.data[i+0] = 0;
			image.data[i+1] = 0;
			image.data[i+2] = 0;
			image.data[i+3] = 0;
		}
	}

	return new Bubble(bb,image);
};
export default select_bubble;