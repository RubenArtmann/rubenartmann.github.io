import { serve } from "https://deno.land/std@0.74.0/http/server.ts";

const server = serve({ hostname: "localhost", port: 8080 });

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

for await (const request of server) {
	let url = "."+request.url;
	if(url.match(/\/$/)) url += "index.html";
	Deno.readFile(url).then((result:Uint8Array)=>{
		const headers = new Headers();
		const contentTypeValue = MEDIA_TYPES[(url.match(/\.[^.]+$/)||[".txt"])[0]];
		headers.set("content-type", contentTypeValue);
		request.respond({ status: 200, body: result, headers: headers });
	}).catch(()=>{
		request.respond({ status: 404, body: "" });
	})
}