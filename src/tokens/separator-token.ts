import { createState, State } from '../query';
import { Token } from './token';

export type Separator = ',';

export class SeparatorToken extends Token {
  separator: Separator;
  tokens: Token[];

	constructor(separator: Separator, tokens: Token[]) {
		super();

    this.separator = separator;
    this.tokens = tokens;
	}

	reduce(state: State) {
    const length = this.tokens.length;
    this.tokens.forEach((token, index) => {
      const last = index === length - 1;
      const tokenState = createState([token], state.parameters.length);

      if (tokenState.text.length > 0) {
        if (!last) {
          tokenState.text[tokenState.text.length - 1] += this.separator;
        }
      }

      state.text.push(...tokenState.text);
      state.parameters.push(...tokenState.parameters);
    });
    return state;
	}
}
