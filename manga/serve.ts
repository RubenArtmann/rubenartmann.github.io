import { serve } from "https://deno.land/std@0.74.0/http/server.ts";

import { multiParser } from 'https://deno.land/x/multiparser@v2.0.3/mod.ts'

import settings from "./settings.js";

let tempDir = Deno.makeTempDirSync();
window.addEventListener("unload",()=>{
	Deno.removeSync(tempDir, { recursive: true });
});
// tempDir = "./temp";

const server = serve({ hostname: "0.0.0.0", port: 8080 });

const reloadNumber = Math.random().toString();

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".jpg": "image/jpeg",
};

let ocr_instances_running = 0;
let ocr_instances_queued = 0;

for await (const request of server) {
	let url = "."+request.url;
	if(url.match(/\/$/)) url += "index.html";

	if(url === "./reload-number") {
		request.respond({ status: 200, body: reloadNumber });
		continue;
	}

	if(url === "./ocr") {
// 		// lets act as if i had a fast cuda gpu and could do this instantly
// 		request.respond({ status: 200, body: `([[0, 0], [254, 0], [254, 50], [0, 50]], '好好对待这位', 0.7154587507247925)
// ([[0, 44], [254, 44], [254, 100], [0, 100]], '能给化学实验', 0.9048158526420593)
// ([[0, 93], [254, 93], [254, 153], [0, 153]], '带来极大帮助', 0.6693715453147888)
// ([[0, 144], [152, 144], [152, 189], [0, 189]], '的女兀', 0.7000624537467957)` });
// 		continue;

		multiParser(request).then(async(form)=>{
			if(form === undefined) return;
			if(Array.isArray(form.files.img)) return;
			let filePath = tempDir+"/"+Math.random().toString().slice(2)+".png";
			Deno.writeFileSync(filePath,form.files.img.content);


			ocr_instances_queued++;

			while(ocr_instances_running>=2) {
				let resolve = ()=>{};
				let promise = new Promise((res)=>{resolve=res;});

				console.log("ocr_instances_queued:",ocr_instances_queued);
				console.log("ocr_instances_running:",ocr_instances_running);

				setTimeout(resolve,1000);

				await promise;
			}

			ocr_instances_queued--;
			ocr_instances_running++;

			const p = Deno.run({
				cmd: ["easyocr", "-l",settings.tesseract_language,"-f",filePath],

				stdout: "piped"
			});
			let output = await p.output();
			let result = (new TextDecoder).decode(output);
			console.log(result);

			ocr_instances_running--;

			request.respond({ status: 200, body: result });
		});
		continue;
	}

	Deno.readFile(url).then((result:Uint8Array)=>{
		let src = (new TextDecoder).decode(result);

		const headers = new Headers();
		const ext = (url.match(/\.[^.]+$/)||[".txt"])[0];
		const contentTypeValue = MEDIA_TYPES[ext];
		if(contentTypeValue !== undefined) headers.set("content-type", contentTypeValue);

		request.respond({ status: 200, body: result, headers });
	}).catch((e)=>{
		console.log("404:",url,e);
		request.respond({ status: 404, body: "" });
	})
}