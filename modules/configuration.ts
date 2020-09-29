// was xhtml, was html, just made a variable to simplify the code
// all home document files are served without their extension, and the index page is assumed to be of this extension
export const homeDocumentExtension = "xml";

// special pages that have their own urls seperate from everything else; add on an as-needed basis
export const [
	errorPage,
	indexPage
] = [
	"404",
	"index"
].map(
	page => `./public/${page}.${homeDocumentExtension}`
);

// setup base headers for every request
export const base = <const>{
	"Strict-Transport-Policy": "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
	"X-Content-Type-Options": "nosniff",
	"Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
	// "Content-Security-Policy": "default-src 'self'; frame-ancestors mediastream blob:; connect-src 'self'; font-src https://fonts.gstatic.com;",
	"Upgrade-Insecure-Requests": "1",
	// "Cache-Control": "public; max-age=86400"
};

Reflect.setPrototypeOf(base, null);

Object.freeze(base);

// all dynamic webpages
export const dynamicPages: Readonly<Record<string, ReadonlyArray<string>>> = {
	"dynamic": [
		"dynamic.xml",
		"dynamic.css",
		"dynamic.js"
	]/*,
	"dynamic_2": [
		"dynamic_.xml",
		"dynamic_.css",
		"dynamic_.js"
	]*/
};

// key: filename of worker in worker directory, without file extension (always .ts)
// value: all web URLs that the worker serves