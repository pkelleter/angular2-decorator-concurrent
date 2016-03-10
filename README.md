# angular2-decorator-concurrent

An Angular2 Decorator to automate running arbitrary functions in an external thread via WebWorker
Written in and compatible only to Angular2 with TypeScript

Installation:

For the moment i have not prepared any conveniant support for installing this decorator.
Please just copy the code from the concurrent.ts file to your project, import the decorator where needed
and use it as explained in the example code.

Example:

In the following example the function "hardFunction"will automatically be wrapped inside of a WebWorker,
because of the given annotation "concurrent", hence the browser will not be blocked while "computing".

However, if you remove the annotation, the browser will of course be blocked for 4 seconds during execution.
Make sure to import the decorator and invoke the function "invokeWebWorker" with some parameter x.

The function will resolve the given promise with (5 * x) if x is even, otherwise it will reject the Promise with (5 * x).

export class ExampleClass {

	private factor = 5;

	constructor() {}

	@concurrent
	public hardFunction(x:number):Promise<number> {
		let it = 0;
		const s = new Date().getTime();
		while (new Date().getTime() - s < 4000) {
			it++;
		}
		const promise = new Promise(
			(resolve, reject) => {
				(x % 2 === 0 ? resolve : reject)(this.factor * x);
			}
		);
		return promise;
	}

	public invokeWebWorker(x:number):void {
		this.hardFunction(x).then(
			(data) => {
				console.log('Success! ', data);
			},
			(error) => {
				console.error ('Error! ', error);
			}
		)
	}

}


Restrictions:

- Since the decorated function will have to return the calculated data as a Promise, since it uses
  a WebWorker to generate the data, the decorated function must return a Promise beforehand.
  Hence only function with a return type of "Promise<any>"" will be decoratable
- Due to technical restrictions the decorated function will only be able to READ variables from its
  context .
  (e.g. "this.factor" in the given example is read-only)
- Other functions in the given context will not be accessible at all - so make sure you
  do not call any other functions inside your decorated function.
  (e.g. "handleWebWorkerButtonClick" in the given example would NOT be accessible)