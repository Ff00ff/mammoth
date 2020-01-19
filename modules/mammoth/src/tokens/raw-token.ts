import { Token } from './token';

export class RawToken extends Token {
	string = '';

	constructor(string: string) {
		super();

		this.string = string;
	}

	reduce(state: any) {
		state.text.push(this.string);
		return state;
	}
}
