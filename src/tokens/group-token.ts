import { createState, State } from '../query';
import { Token } from './token';

export class GroupToken extends Token {
  tokens: Token[];

	constructor(tokens: Token[]) {
		super();

    this.tokens = tokens;
	}

	reduce(state: State) {
    const tokensState = createState(this.tokens, state.parameters.length);
    state.parameters.push(...tokensState.parameters);

    const index = tokensState.text.length - 1;
    if (index >= 0) {
      tokensState.text[0] = `(${tokensState.text[0]}`;
      tokensState.text[tokensState.text.length - 1] = `${tokensState.text[tokensState.text.length - 1]})`;
    }
    else {
      // TODO: If there are no items. Shuold we still add the () characters? Or a fallback?
    }

    state.text.push(...tokensState.text);
		return state;
	}
}
