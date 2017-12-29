import { createState, State } from '../query';
import { Token } from './token';

export class CollectionToken extends Token {
  tokens: Token[];

	constructor(tokens: Token[]) {
		super();

    this.tokens = tokens;
	}

	reduce(state: State) {
    const tokensState = createState(this.tokens, state.parameters.length);
    state.parameters.push(...tokensState.parameters);
    state.text.push(...tokensState.text);
		return state;
	}
}
