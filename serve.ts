import { serve } from "https://deno.land/std@0.74.0/http/server.ts";

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
};

const processGlslFile = (src: string)=>{
	let results = src.match(/#include (.+)\n/g);
	if(results === null) return src;
	for (let i = 0; i < results.length; ++i) {
		let path = (results[i].match(/#include (.+)\n/)as string[])[1];
		let buf = Deno.readFileSync(path);
		let file = (new TextDecoder).decode(buf);
		src = src.replace(results[i], processGlslFile(file));
	}
	return src;
};

for await (const request of server) {
	let url = "."+request.url;
	if(url.match(/\/$/)) url += "index.html";

	if(url === "./reload-number") {
		request.respond({ status: 200, body: reloadNumber });
		continue;
	}

	Deno.readFile(url).then((result:Uint8Array)=>{
		let src = (new TextDecoder).decode(result);
		const headers = new Headers();
		const ext = (url.match(/\.[^.]+$/)||[".txt"])[0];
		const contentTypeValue = MEDIA_TYPES[ext];
		headers.set("content-type", contentTypeValue);
		if(ext === ".glsl") {
			src = processGlslFile(src);
		}

		// let path = "./output/"+url.slice(2);
		// console.log(path.split("/").slice(0,-1).join("/"))
		// Deno.mkdirSync(path.split("/").slice(0,-1).join("/"), { recursive: true });
		// Deno.writeTextFileSync(path,src);
		// console.log(path)

		request.respond({ status: 200, body: src, headers: headers });
	}).catch((e)=>{
		console.log("404:",url,e);
		request.respond({ status: 404, body: "" });
	})
}