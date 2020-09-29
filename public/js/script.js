self.onerror = alert;

import { highlighter } from "./highlight.js";

// update: this actually ought to be a details tag, if anyone doesn't start on swapping it, I'ma try myself
const mobileLinks = document.querySelector("#mobile-links");

// one could argue that this ought to be an HTML <details> tag, and use 0% JavaScript
// It could
document.querySelector(".nav-burger")
.addEventListener(
	"click",
	() => {
			mobileLinks.style.setProperty(
				"display",
				mobileLinks.style.getPropertyValue("display")
					? ""
					: "block"
			);
	}, {
		passive: true
	}
);

// Lang Definitions //

highlighter.defineLanguage("encode", {
name: "encode",
syntax: {
	whitespace: ["\t", " ", "\n"],
	inlineComment: /\/\/.*/,

	keywords: [
	{ color: "rgb(245, 144, 37)", value: "set" },
	{ color: "rgb(90, 90, 90)", value: "with" },
	{ color: "rgb(245, 144, 37)", value: "create" },
	{ color: "rgb(90, 90, 90)", value: "is" },
	"add",
	"change",
	"go",
	"param",
	"function",
	"call",
	"return",
	"constant",
	"import",
	"if",
	"else",
	"than",
	],
	datatypes: [],

	operators: [
	"not", "&", "^", "exclusive", "and", "or",
	{ color: "rgb(90, 90, 90)", value: "to" },
	{ color: "rgb(90, 90, 90)", value: "equal" },
	"greater", "less", "&&", "||",
	">", "<", ">=", "<=", "==",
	"*", "/", "%", "+", "-"
	],

	delimiters: ["{", "}", ";", ".", ","],
	identifiers: /[_$#\w][_$#\w\d]*/,

	escapes: /\\"|\\'|\\`/,

	strings: [
	{
		begin: "\"",
		end: "\""
	}
	],

	numbers: /\d+(\.\d+)?/,

},
color: {
	keywords: "blue",
	datatypes: "blue",
	operators: "default", // Can also be ommited
	strings: "default",
	numbers: "default",
}
});

highlighter.highlightAll();