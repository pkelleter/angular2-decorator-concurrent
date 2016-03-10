# angular2-decorator-concurrent

An Angular2 Decorator to automate running arbitrary functions in an external thread via WebWorker

Example:

export class ExampleClass {

	private factor = 5;

	constructor() {}

	@nxConcurrent
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

	public handleWebWorkerButtonClick(param) {
		this.hardFunction(param).then(
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