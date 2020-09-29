// 2 main files, maybe add "warn" and more later to mimic the "console" namespace?
const [
	log,
	error
] = await Promise.all(
	[
		"log",
		"error"
	].map(
		fileName => Deno.open(
			`./logs/${fileName}.log`, {
				write: true,
				read: false,
				truncate: false,
				create: false
				// { append: true } not supported in Repl's old Deno :(
			}
		)
	)
);

// ensure nothing is written until the file's cursers have been adjusted properly
// ignore return values, just wait for the promises to resolve
await Promise.all(
	(<const>[
		<const>[
			"./logs/log.log",
			log
		],
		<const>[
			"./logs/error.log",
			error
		]
	]).map(
		async ([ location, file ]): Promise<unknown> => file.seek(
			(await Deno.lstat(location)).size,
			Deno.SeekMode.Start
		)
	)
);

const encode: (x: string) => Uint8Array =
	TextEncoder
	.prototype
	.encode
	.bind(new TextEncoder);

// expand as new methods are added to this fs "console"
// Readonly<Record<"log" | "error", Deno.File>>
const logOrError: {
	readonly log: Deno.File,
	readonly error: Deno.File
} = Object.freeze(
	Object.assign(
		Object.create(null), {
			log,
			error
		}
	)
);

type data_t = {
	readonly type: keyof typeof logOrError,
	readonly args: string[]
};

// replaces all quotes with UTF-8 "smart" quotes
const formatAllQuotes = (x: string) =>
	x.replace(
		/"([^]*)"/gm,
		"\u201C$1\u201D"
	).replace(
		/'/gm,
		'\u2019'
	);

// primary listener
self.addEventListener(
	"message",
	<EventListener>
	<(evt: MessageEvent) => void>
	(async ({
		data: {
			type,
			args: [ formatString, ...formatArgs ]
		}
	}: { data: data_t }) => {
		const newLog =
			formatString
			.replace(
				/{}/gm,
				() => formatArgs.shift() ?? "[[Error: missing format argument]]"
			);

		// assert(formatArgs.length === 0);

		// not waiting might result in concurrent writes
		await logOrError[type]
		.write(
			encode(`[${new Date().toTimeString()}]: ` + formatAllQuotes(newLog) + "\n\n")
		);
	}), {
		passive: true
	}
);

// Indicates to the main thread that the logger is ready to write to files!
self.postMessage(null);