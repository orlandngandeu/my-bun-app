import { serve } from "bun";
import figlet from "figlet";
import index from "./index.html";

const server = serve({
	port: 3000,
	routes: {
		"/": index,
		"/figlet": () => {
			const body = figlet.textSync("ORLAN NGANDEU!");
			return new Response(body);
		},
	},
});

console.log(`Listening on ${server.url}`);
