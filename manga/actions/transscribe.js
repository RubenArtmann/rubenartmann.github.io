import settings from "../settings.js";

const { createWorker, createScheduler, setLogging } = Tesseract;
setLogging(true);
const scheduler = createScheduler();
for (let i = 0; i < settings.tesseract_workers; i++) {
	(async () => {
		const worker = createWorker();
		await worker.load();
		await worker.loadLanguage(settings.tesseract_language);
		await worker.initialize(settings.tesseract_language);
		scheduler.addWorker(worker);
		console.log("worker loaded");
	})();
}

const transscribe = async(bubbles)=>{
	for(let i=0; i<bubbles.length; i++) {
		console.log(i+1,"/",bubbles.length);
		let c = bubbles[i].image.getBBAsCtx();

		let result = await scheduler.addJob('recognize',
			c.canvas,
			settings.tesseract_language
		);
		let text = result.data.text;
		bubbles[i].transscript = text;
		console.log(text);

		document.querySelector("#render").click();
	}
};
export default transscribe;