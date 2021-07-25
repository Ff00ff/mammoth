import { State, Token } from './token';

export class EmptyToken extends Token {
  reduce(state: State) {
    return state;
  }
}
