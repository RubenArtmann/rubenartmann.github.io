const download = async(bubbles)=>{
	let urls = [];
	let zip = new JSZip();

	for(let i = 0; i<imgView.element.childNodes.length; i++) {
		let e = imgView.element.childNodes[i];

		let resolve;
		let promise = new Promise((res)=>{resolve=res;});

		e.toBlob(async(blob)=>{
			console.log(blob);
			let b = await blob.arrayBuffer();
			console.log(b);
			resolve(b);
		});

		zip.file(`${i}.png`, await promise, {
			binary: true
		});
	}
	zip.generateAsync({
		type: 'blob'
	}).then((content)=>{
		saveAs(content, "chapter.zip");
	});
};
export default download;