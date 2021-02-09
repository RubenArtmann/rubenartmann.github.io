import ImageView from "./ImageView.js";


export default class Bubble {
	constructor(boundingBox,image) {
		this.boundingBox = boundingBox;
		this.image = image;

		if(this.boundingBox.width !== this.image.width||this.boundingBox.height !== this.image.height) {
			console.log(this);
			throw new Error("");
		}

		this.transscript = "<transscript not generated yet>";
		this.translation = null;

		// console.log(this);

		// let c = img.getBBAsCtx(boundingBox);
		// let c = image.getBBAsCtx();

		// document.body.appendChild(c.canvas);

		// c.canvas.toBlob(async(blob)=>{
		// 	let formData = new FormData();
		// 	formData.append("img", blob);
		// 	let result = await fetch('/ocr', {method: "POST", body: formData});
		// 	let text = await result.text();
		// 	console.log(text);
		// 	let parsed = text.split("\n").map(s=>JSON.parse(`"${s.split("'").slice(1,-1).join("'")}"`));
		// 	console.log(parsed);

		// 	this.transscript = parsed.join("\n");
		// 	document.querySelector("#render").click();
		// });






		// Tesseract.recognize(
		// 	c.canvas,
		// 	'chi_sim',
		// 	{ logger: m => console.log(m) }
		// ).then(({ data: { text } }) => {
		// 	this.transscript = text;
		// 	console.log(text);

		// 	document.querySelector("#render").click();
		// });
	}
}