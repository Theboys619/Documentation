// all logs are done in another thread to reduce the load on the main thread
const logger = new Worker(
	new URL(
		"../log.ts",
		import.meta.url
	).href, {
		type: "module",
		deno: true
	}
);

// no logging may be done until the logging thread is up and running
await new Promise(
	resolve => {
		logger.addEventListener(
			"message",
			resolve, {
				passive: true,
				once: true
			}
		)
	}
);

// logs errors and info into files
const logFunc = async (type: "log" | "error", ...args: string[]) => {
	logger.postMessage({ type, args });
};

type log_t = (...data: string[]) => Promise<void>;

// both offer a Rust println like syntax, all formatting is done on the other thread, and these only accept strings, partially because that's all we should ever need to send, and partially because Deno's Workers are broken
export const error: log_t = logFunc.bind(null, "error");

export const log: log_t = logFunc.bind(null, "log")