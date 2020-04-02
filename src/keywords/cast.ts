import { Keyword } from '.';
import { NoSpaceToken, Token } from '../tokens';

export class Cast extends Keyword {
  private tokens: Token[];
  private type: string;

  constructor(tokens: Token[], type: string) {
    super();

    this.tokens = tokens;
    this.type = type;
  }

  toTokens() {
    return [...this.tokens, new NoSpaceToken(this.type)];
  }
}

export const cast = (tokens: Token[], type: string) => {
  return new Cast(tokens, type);
};
