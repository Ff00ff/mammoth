import { Token } from './token';

export class ParameterToken extends Token {
	parameter: any;

	constructor(parameter: any) {
		super();

		this.parameter = parameter;
	}

	reduce(state: any, numberOfParameters: number) {
		state.text.push(`$${numberOfParameters + 1}`);
		state.parameters.push(this.parameter);
		return state;
	}
}
