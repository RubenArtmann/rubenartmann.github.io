export default class Image {
	constructor(width,height) {
		this.width = width;
		this.height = height;
		this.data = new Uint8ClampedArray(width*height*4);
		this.onchanged = [];
	}
	changed() {this.onchanged.forEach(e=>e());}
	get(x,y) {
		if(x<0||x>this.width||y<0||y>this.height) return new Uint8ClampedArray([0,0,0,0]);
		let i = (x+y*this.width)*4;
		return this.data.slice(i,i+4);
	}
	getBBAsCtx(bb={x:0,y:0,width:this.width,height:this.height}) {
		if(!bb.maxX) bb.maxX = bb.x+bb.width;
		if(!bb.maxY) bb.maxY = bb.y+bb.height;
		
		let canvas = document.createElement("canvas");
		canvas.width = bb.width;
		canvas.height = bb.height;
		let c = canvas.getContext("2d");

		let data = this.slice(bb).data;

		let imageData = new ImageData(data,bb.width,bb.height);
		c.putImageData(imageData,0,0);

		c.x = bb.x;
		c.y = bb.y;

		return c;
	}
	putBBAsCtx(c) {
		let image = new Image(c.canvas.width,c.canvas.height);
		image.drawImage(c.canvas,0,0);
		this.insert(image,c.x,c.y);
		// this.drawImage(c.canvas,c.x,c.y);
	}
	drawImage(image,x,y) {
		let canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;
		let c = canvas.getContext("2d");
		let imageData = new ImageData(this.data,this.width,this.height);
		c.putImageData(imageData,0,0);

		c.drawImage(image,x,y);

		this.data = c.getImageData(0,0,this.width,this.height).data;

		this.changed();
	}
	drawText(text,x,y) {
		let canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;
		let c = canvas.getContext("2d");

		let imageData = new ImageData(this.data,this.width,this.height);
		c.putImageData(imageData,0,0);

		c.fillStyle = "#000";
		c.fillText(text,x,y);
		console.log(text,x,y)

		this.data = c.getImageData(0,0,this.width,this.height).data;
		console.log(this.data);
		this.changed();
	}
	fill(x1,y1,x2,y2,r,g,b,a) {
		for (let y = y1; y <= y2; y++) {
			for (let x = x1; x <= x2; x++) {
				let i = (x+y*this.width)*4;
				this.data[i+0] = r;
				this.data[i+1] = g;
				this.data[i+2] = b;
				this.data[i+3] = a;
			}
		}
		this.changed();
	}
	slice(bb) {
		let img = new Image(bb.width,bb.height);
		for (let y = bb.y; y < bb.maxY; y++) {
			for (let x = bb.x; x < bb.maxX; x++) {
				let i1 = (x-bb.x+(y-bb.y)*img.width)*4;
				let i2 = (x+y*this.width)*4;
				img.data[i1+0] = this.data[i2+0];
				img.data[i1+1] = this.data[i2+1];
				img.data[i1+2] = this.data[i2+2];
				img.data[i1+3] = this.data[i2+3];
			}
		}
		return img;
	}
	insert(img,x_off,y_off) {
		if(img instanceof HTMLImageElement) {
			let newImage = new Image(img.width,img.height);
			newImage.drawImage(img,0,0);
			img = newImage;
		}
		for (let y = 0; y < img.height; y++) {
			for (let x = 0; x < img.width; x++) {
				let i1 = (x+x_off+(y+y_off)*this.width)*4;
				let i2 = (x+y*img.width)*4;
				this.data[i1+0] = img.data[i2+0];
				this.data[i1+1] = img.data[i2+1];
				this.data[i1+2] = img.data[i2+2];
				this.data[i1+3] = img.data[i2+3];
			}
		}
		this.changed();
	}
}