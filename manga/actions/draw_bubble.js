const draw_bubble = (img,bubble)=>{
	let bb = bubble.boundingBox;
	let b = 3;
	// img.fill(bb.x-b,bb.y-b,bb.maxX+b,bb.maxY+b,255,255,255,255);

	for (let y = 0; y < bb.height; y++) {
		for (let x = 0; x < bb.width; x++) {
			let i = (x+bb.x+(y+bb.y)*img.width)*4;
			if(bubble.image.data[(x+y*bb.width)*4+3]===0) continue;
			img.data[i+0] = 255;
			img.data[i+1] = 255;
			img.data[i+2] = 255;
			img.data[i+3] = 255;
		}
	}
	img.changed();

	const check_line = (x,y)=>{
		let xmin = x;
		while(img.get(xmin,y)[0]>230) xmin--;
		let xmax = x;
		while(img.get(xmax,y)[0]>230) xmax++;
		// img.fill(xmin+1,y,xmax-1,y,255,0,0,255);
		return [xmin+1,xmax-1];
	};

	let x = Math.round(bb.x+bb.width/2);
	let y = Math.round(bb.y+bb.height/2);
	let neededWidth = 100;
	while(true) {
		y--;
		let result = check_line(x,y);
		if(result[1]-result[0]<neededWidth || y<0) break;
		let centerx = result[0]/2+result[1]/2;
		// x = Math.round(centerx*0.01+x*0.99);

		// img.fill(x,y,x,y,255,0,0,255);
	}
	let r = check_line(x,y);

	// let canvas = document.createElement("canvas");
	// let c = canvas.getContext("2d");

	let biggerBB = {
		x:0,
		y:Math.max(0,bb.y-500),
		width: img.width,
		height: bb.height+1000
	};
	biggerBB.maxX = biggerBB.x+biggerBB.width;
	biggerBB.maxY = biggerBB.y+biggerBB.height;

	let c = img.getBBAsCtx(biggerBB);

	const layoutText = (fontSize,x,y,text,draw)=>{
		let words = text.replace(/\n/g," ").split(" ");
		c.font = `${fontSize}px sans`;

		while(words.length > 0) {
			let r1 = check_line(x,y);
			let r2 = check_line(x,y+fontSize);
			let left = Math.max(r1[0],r2[0]);
			let right = Math.min(r1[1],r2[1]);
			// let maxWidth = right-left;
			let maxWidth = Math.min(x-left,right-x)*2;

			let string = "";

			while(words.length > 0) {
				let word = words[0];
				let newString = string + ((string==="")?"":" ") + word;
				if(c.measureText(newString).width < maxWidth) {
					string = newString;
					words.shift();
				}  else  break;
			}

			let pos = left/2+right/2;
			if(draw) {
				c.textAlign = 'center';
				c.textBaseline = 'top';
				c.fillText(string,x-c.x,y-c.y);
			}

			let increment = fontSize;
			if(string === "") increment = 1;

			for (let i = 0; i < increment; i++) {
				y++;
				if(img.get(x,y+fontSize)[0]<230 && words.length>0) return false;
				// c.fillRect(x,y,1,1);
			}
		}

		return words.length === 0;
	};

	let text = bubble.translation || bubble.transscript;

	let fontSize = 5;
	while(fontSize<100 && layoutText(fontSize,x,y,text)) fontSize++;
	fontSize--;

	layoutText(fontSize,x,y,text,true);

	img.putBBAsCtx(c);

	// img.drawText(bubble.transscript,r[0],y);
};
export default draw_bubble;