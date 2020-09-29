import {
	response_t,
	fn_response_t,
	pageServer
} from "./types.ts";

import {
	dynamicPages
} from "./configuration.ts";

const url = new URL(
	"../workers/",
	import.meta.url
);

type strings = ReadonlyArray<string>;

const setup: ReadonlyArray<readonly [string, strings]> = Object.entries(dynamicPages).map(
	([ worker, files ]: [ string, strings ]) => <const>[
		worker,
		[...new Set(files)].map(file => `/${file}`)
	]
);

// waiting for workers to finish initialization; ex: { postMessage(null) }
const workerStartUp: ReadonlyArray<Promise<readonly [Worker, strings]>> =
setup
.map(
	async ([
		workerURL,
		webPageURLs
	]: readonly [ string, strings ]) => {
		const worker = new Worker(
			new URL(
				`${workerURL}.ts`,
				url
			).href, {
				type: "module",
				deno: true
			}
		);

		await new Promise(
			resolve => {
				worker.addEventListener(
					"message",
					resolve, {
						passive: true,
						once: true
					}
				);
			}
		);

		return <const>[
			worker,
			webPageURLs
		];
	}
);

const workers: ReadonlyArray<readonly [Worker, strings]> = await Promise.all(workerStartUp);

const timeout = <T>(time: number, data: T): Promise<T> =>
	new Promise(
		resolve => setTimeout(resolve, time * 1000, data)
	);

const serve = async (worker: Worker): Promise<fn_response_t> => {
	const response = <Promise<MessageEvent>>new Promise<Event | MessageEvent>( // fn_response_t
		resolve => {
			worker.addEventListener(
				"message",
				resolve, {
					once: true,
					passive: true
				}
			);
		}
	);

	worker.postMessage(null);

	return Promise.race([
		response.then(({data}) => data),
		timeout(10, { status: 500 })
	]);
};

type fileServerTuple = readonly [string, pageServer];

type fileServerList = ReadonlyArray<fileServerTuple>;

const servers: ReadonlyArray<fileServerList> = workers.map(
	([ worker, pages ]): fileServerList => {
		const fn: pageServer = async request => serve(worker);

		return pages.map(
			(page: string) => <const>[ page, fn ]
		);
	}
);

type fileRecord = Readonly<Record<string, pageServer>>;

// reduce the server maps to one map
export default
<fileServerList>Object.entries(
	<fileRecord>Object.assign(
		<fileRecord>Object.create(null),
		...servers.map(Object.fromEntries)
	)
);

// console.log(servers);