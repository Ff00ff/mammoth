import { Token } from './token';

export class AliasToken extends Token {
	alias: string;

	constructor(alias: string) {
		super();

		this.alias = alias;
	}

	reduce(state: any) {
		state.text.push(`"${this.alias}"`);
		return state;
	}
}
