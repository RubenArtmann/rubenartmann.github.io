import Image from "./Image.js";
import ImageView from "./ImageView.js";
import select_bubble from "./actions/select_bubble.js";
import select_thought_bubble from "./actions/select_thought_bubble.js";
import draw_bubble from "./actions/draw_bubble.js";
import transscribe from "./actions/transscribe.js";
import download from "./actions/download.js";

window.draw_bubble = draw_bubble;

window.bubbles = [];

window.img = new Image(0,0);
console.log(img);

window.imgView = new ImageView(img);
console.log(imgView);
document.body.appendChild(imgView.element);

let fileInput = document.querySelector("#fileinput");

const loadFiles = async()=>{
	if(fileInput.files) {
		let promises = [...fileInput.files].map((file)=>{
			let img = document.createElement("img");

			let resolve;
			let promise = new Promise((res)=>{resolve=res;});

			img.onload = ()=>{
				resolve(img);
			};
			img.src = URL.createObjectURL(file);

			return promise;
		});
		let images = await Promise.all(promises);

		// console.log(images);
		let width = 0;
		let height = 0;
		for(let img of images) {
			width = width>img.width?width:img.width;
			height += img.height;
		}
		let image;
		if(img.width === width && img.height === height) {
			image = img;
		}  else  {
			// lets free the old image to be sure
			img.data = null;

			image = new Image(width,height);
		}
		let y = 0;
		for(let img of images) {
			image.insert(img,0,y);
			y += img.height;
		}

		img = image;
		imgView.changeImage(image);
	}
};

fileInput.addEventListener("change", loadFiles);

document.querySelector("#render").addEventListener("click",async()=>{
	// img.drawImage(imageElement,0,0);
	await loadFiles();
	bubbles.forEach(e=>draw_bubble(img,e));
});
document.querySelector("#transscribe").addEventListener("click",async()=>{
	transscribe(bubbles);
});
document.querySelector("#download").addEventListener("click",async()=>{
	download(bubbles);
});
document.querySelector("#copytransscript").addEventListener("click",()=>{
	let text = bubbles.map(b=>b.transscript.replace(/\n/g," ")).join("\n#####\n");
	navigator.clipboard.writeText(text);
});
document.body.addEventListener('paste', (event) => {
	let text = (event.clipboardData || window.clipboardData).getData('text');
	
	let translations = text.split("\n#####\n");

	for (let i = 0; i < bubbles.length; i++) {
		bubbles[i].translation = translations[i];
	}

	document.querySelector("#render").click();
});

let downX = 0;
let downY = 0;
imgView.on("mousedown",(x,y)=>{
	downX = x;
	downY = y;
});
imgView.on("contextmenu",(x,y,e)=>{
	if(e.stopPropagation) e.stopPropagation();
	e.preventDefault();
});
imgView.on("mouseup",(x,y,e)=>{
	// console.log(x,y,e)

	if(Math.abs(downX-x)>10||Math.abs(downY-y)>10) {
		console.log("dragged from",downX,downY,"to",x,y);
		if(e.button === 0) {
			console.log("selecting thought bubble");
			let bubble = select_thought_bubble(img,downX,downY,x,y);

			draw_bubble(img,bubble);

			bubbles.push(bubble);

			let e = (new ImageView(bubble.image)).element;
			document.body.appendChild(e);
		}  else  if(e.button === 2) {
			console.log("splitting bubble");
			let bb = {
				x: Math.min(x,downX),
				y: Math.min(y,downY),
				maxX: Math.max(x,downX),
				maxY: Math.max(y,downY)
			};
			bb.width = bb.maxX-bb.x;
			bb.height = bb.maxY-bb.y;

			let c = img.getBBAsCtx(bb);

			c.strokeWidth = 5;
			c.beginPath();
			c.moveTo(x-bb.x,y-bb.y);
			c.lineTo(downX-bb.x,downY-bb.y)
			c.stroke();
			img.putBBAsCtx(c);
		}

	}  else  {
		console.log("clicked",x,y);
		console.log("selecting normal bubble");
		// img.fill(x-1,y-1,x+1,y+1,255,0,0,255);
		// alert(x,y)
		let bubble = select_bubble(img,x,y);

		draw_bubble(img,bubble);

		bubbles.push(bubble);

		let e = (new ImageView(bubble.image)).element;
		document.body.appendChild(e);
	}
});