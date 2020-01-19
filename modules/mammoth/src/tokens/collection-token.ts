import { createState, State } from '../query/base';
import { Token } from './token';

export class CollectionToken extends Token {
  tokens: Token[];

  constructor(tokens: Token[]) {
    super();

    this.tokens = tokens;
  }

  reduce(state: State, numberOfParameters: number) {
    const tokensState = createState(this.tokens, numberOfParameters);
    state.parameters.push(...tokensState.parameters);
    state.text.push(...tokensState.text);
    return state;
  }
}
