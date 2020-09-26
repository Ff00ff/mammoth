import { Token } from './token';

export class EmptyToken extends Token {
  reduce(state: any) {
    return state;
  }
}
