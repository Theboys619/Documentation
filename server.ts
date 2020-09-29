import { serve, ServerRequest } from "https://deno.land/std@0.59.0/http/server.ts";

import {
	homeDocumentExtension,
	errorPage,
	indexPage,
	base
} from "./modules/configuration.ts";

import mimes from "./modules/mimes.ts";

import { log, error } from "./modules/logger.ts";

import {
	response_t,
	fn_response_t,
	pageServer
} from "./modules/types.ts";

import servers from "./modules/dynamicPages.ts";

log(
	"Server started at: {}!",
	new Date().toLocaleDateString()
);

const defaultHandler: pageServer = request => {
	const rurl = request.url;

	log("Sending normal page!");

	// get extension and mime from request URL
	const url = rurl.split('.');

	// document, as in html / xml document, whatever our home page is
	const isDoc = url.length === 1;

	// missing extension automatically gets the home extension
	const extension = isDoc
		? homeDocumentExtension
		: url[url.length - 1];

	log("client URL: {}", rurl);

	// if their request doesn't have the extension, then send the associated file with the doc extension, otherwise just send the page.
	return Deno.readFile(
		`./public${rurl}${
			isDoc
				? '.' + homeDocumentExtension
				: ""
		}`
	).then(
		// file was read just fine, send it along
		body => (<fn_response_t>{
			status: 200,
			headers: {
				...base,
				"Content-Type": mimes[extension]
			},
			body
		})
	).catch(
		// file failed to read
		async () => {
			error("Someone requested a non-existant file! URL: {}", rurl);

			// this will be sent in response to anything, want a JavaScript file? Get 404.xml
			// Send 404 page
			return <fn_response_t>{
				status: 404,
				body: await Deno.readFile(errorPage),
				ok: false
			}
		}
	);
};

const handlers: ReadonlyMap<string, pageServer> = new Map([
	[ '/', async request => {
		// pretty damn rhetorical

		log("Sending home page!");

		const headers = {
			...base,
			"Content-Type": "application/xhtml+xml"
		};

		// We shouldn't need to worry about the home page disappearing
		return {
			status: 200,
			headers,
			body: [...await Deno.readFile(indexPage)]
		};
	} ],
	...servers
]); // end handlers

for ( const [ , fn ] of handlers ) {
	Reflect.deleteProperty(fn, "name");

	Object.freeze(fn);
}

// main loop
for await (
	const request of serve({ port: 8080 })
) {
	log(`URL requested: "{}"`, request.url);

	// determine what file was requested, and send appropriately
	const rurl = request.url;

	(handlers.has(rurl)
		? handlers.get(rurl)
		: defaultHandler
	)!(request)
	.catch(
		() => {
			error("Response handler rejected with an error! URL: {}", rurl);

			return <fn_response_t>{
				status: 500,
				body: "Well... umm... so here's the thing: our server has an error somewhere, we just don't know where.",
				ok: false
			};
		}
	).then(
		// after all of that, finally send the data
		(response: fn_response_t) => {
			let body: response_t["body"] = undefined;

			switch ( typeof response.body ) {
				case "string": {
					({ body } = response);
					break;
				} case "object": {
					if ( Symbol.iterator in response.body ) {
						body = Uint8Array.from(<Iterable<number>>response.body);
					} else if ( response.body instanceof Uint8Array ) {
						({ body } = response);
					}
					break;
				}
			};

			const { headers } = response;

			const res = <response_t>{
				...response,
				body,
				headers: typeof headers === "undefined"
					? headers
					: new Headers(headers)
			};

			request.respond(res);
			// one way or another, something was sent
			log("Sent a file!");
		}
	);

} // end loop