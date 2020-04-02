import { Token } from './token';

export class NoSpaceToken extends Token {
  string: string;

  constructor(string: string) {
    super();

    this.string = string;
  }

  reduce(state: any) {
    const text = state.text[state.text.length - 1];
    state.text[state.text.length - 1] = `${text}${this.string}`;
    return state;
  }
}
