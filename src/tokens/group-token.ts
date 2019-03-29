import { createState, State } from '../query';
import { Token } from './token';

export class GroupToken extends Token {
  tokens: Token[];
  open: string;
  close: string;

  constructor(tokens: Token[], open = '(', close = ')') {
    super();

    this.open = open;
    this.close = close;
    this.tokens = tokens;
  }

  reduce(state: State, numberOfParameters: number) {
    const tokensState = createState(this.tokens, numberOfParameters);
    state.parameters.push(...tokensState.parameters);

    const index = tokensState.text.length - 1;
    if (index >= 0) {
      tokensState.text[0] = `${this.open}${tokensState.text[0]}`;
      tokensState.text[tokensState.text.length - 1] = `${
        tokensState.text[tokensState.text.length - 1]
      }${this.close}`;
    } else {
      // TODO: If there are no items. Shuold we still add the () characters? Or a fallback?
    }

    state.text.push(...tokensState.text);
    return state;
  }
}
