export default class ImageView {
	constructor(image) {
		this.image = image;
		this.element = document.createElement("div");
		this.element.className = "imageView"

		this.needsRender = Math.random();
		this.lastRender = null;

		this.image.onchanged.push(()=>{
			this.needsRender = Math.random();
		});

		const drawLoop = ()=>{
			requestAnimationFrame(drawLoop);
			if(this.needsRender !== this.lastRender) this.render();
			this.lastRender = this.needsRender;
		};
		drawLoop();
	}
	changeImage(image) {
		this.image = image;
		this.needsRender = Math.random();

		this.image.onchanged.push(()=>{
			this.needsRender = Math.random();
		});
	}
	render() {
		let currentRender = this.needsRender;

		let slices = [];
		let y = 0;
		let i = 0;
		while(y<this.image.height) {
			let height = this.image.height - y;
			if(height>2000) height = 2000;

			slices.push([i,y,y+height]);

			y += height;
			i++;
		}

		slices.sort((a,b)=>(Math.abs(a[2]-window.scrollY)-Math.abs(b[2]-window.scrollY)));

		const populateCanvas = (index,y,maxY)=>{
			if(currentRender !== this.needsRender) return;
			if(y>=this.image.height) {
				while(this.element.childNodes.length>index) this.element.childNodes[this.element.childNodes.length-1].remove();
				return;
			}
			let height = maxY - y;
			// console.log(index,y,height);

			let canvas = this.element.childNodes[index];
			if(!canvas) {
				canvas = document.createElement("canvas");
				this.element.appendChild(canvas);
			}

			canvas.width = this.image.width;
			canvas.height = height;
			let c = canvas.getContext("2d");

			let imageData = new ImageData(this.image.slice({
				x:0,
				y:y,
				width:this.image.width,
				height:height,
				maxX:this.image.width,
				maxY:height+y
			}).data,this.image.width,height);
			c.putImageData(imageData,0,0);

			setTimeout(()=>{
				if(slices.length>0) populateCanvas(...slices.shift());
			},100);
		};
		if(slices.length>0) populateCanvas(...slices.shift());
	}
	on(event,callback) {
		this.element.addEventListener(event,(e)=>{
			// due to heavy cpu usage, scroll position may have already changed!

			// WRONG!!!
			// let rect = this.element.getClientRects()[0]
			// callback(Math.round(e.x-rect.x),Math.round(e.y-rect.y),e);

			// CORRECT!!!
			let x = Math.round(e.pageX-this.element.offsetLeft);
			let y = Math.round(e.pageY-this.element.offsetTop);
			console.log(x,y,e,this.element);
			this.image.fill(x-5,y-5,x+5,y+5,255,0,0,255);
			callback(x,y,e);
		});
	}
}