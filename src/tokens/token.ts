export abstract class Token {
	abstract reduce(state: any, numberOfParameters: number): any;
}
