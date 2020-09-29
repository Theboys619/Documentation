// the listener should return this type!
import { fn_response_t } from "../modules/types.ts";

// resolves promise waiting for a message from this thread, indicated that the thread is ready to send data
self.postMessage(null);

// a file was requested 
self.addEventListener(
	"message",
	// currently not passing any data, what data do threads need?
	() => {
		// equivalent to returning

		self.postMessage(
			<fn_response_t>{
				body: (Math.random() * 10).toString(10)
			}
		);
	}, {
		passive: true
	}
);