// TSC is acting dumb about my double "await"s, thinks that it's a function call instead
declare const await: <T>(promise: Promise<T>) => T;

// if it's missing anything, tell me and I'll add to it
export default Object.freeze(
	await<Record<string, string>>(
		(await fetch(
			"https://FOS.xxperthacker.repl.co/Data/JSON/mimes.json", {
				mode: "cors"
			}
		)
	).json())
);