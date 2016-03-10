interface IWebWorkerMessageEvent<T> extends MessageEvent {
	data: {
		data: T,
		rejected: boolean
	}
}

export function concurrent<T> (target:Object,
								 propertyKey:string,
								 descriptor:TypedPropertyDescriptor<(...args:any[]) => Promise<T>>) {

	// remember original function for later invokation as a normalized string (no linebreaks)
	const _originalFunctionAsString = descriptor.value.toString().replace(/(\r\n|\n|\r)/gm, "");

	// wrap original function by web worker
	descriptor.value = function (...args:any[]) {
		const promise = new Promise(
			(resolve, reject) => {
				// create object url from function
				const objectUrl = URL.createObjectURL(
					new Blob([`
							self.addEventListener(
								'message',
								function (evt) {
									var eventData = JSON.parse(evt.data),
										scope = eventData.scope,
										params = eventData.params,
										fnGenerator = new Function("return ${_originalFunctionAsString}"),
										fn = fnGenerator(),
										resultingPromise = fn.apply(scope, params);
									resultingPromise.then (
										function (result) {
											self.postMessage({
												data: result,
												rejected: false
											});
										},
										function (error) {
											self.postMessage({
												data: error,
												rejected: true
											});
										}
									);
								},
								false
							);
						`], {type: 'application/javascript'})
				);

				// create web worker and release resources
				const worker = new Worker(objectUrl);
				URL.revokeObjectURL(objectUrl);

				// add listeners to webworker
				worker.onmessage = function (evt:IWebWorkerMessageEvent<T>) {
					(evt.data.rejected ? reject : resolve)(evt.data.data);
				};
				worker.onerror = reject;
				// start webworker
				worker.postMessage(
					JSON.stringify({
						scope: this,
						params: args
					})
				);
			}
		);
		return promise;
	};
	return descriptor;

}