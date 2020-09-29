import { ServerRequest } from "https://deno.land/std@0.59.0/http/server.ts";

export type response_t = Parameters<ServerRequest["respond"]>[0];

export type fn_response_t = {
	headers?: Record<string, string>,
	body?: Iterable<number> | string | Uint8Array,
	ok?: boolean,
	status?: number
};

export type pageServer = (request: ServerRequest) => Promise<fn_response_t>;