import { State, Token } from './token';

export class StringToken extends Token {
  string: string;

  constructor(string: string) {
    super();

    this.string = string;
  }

  reduce(state: State) {
    state.text.push(this.string);
    return state;
  }
}
