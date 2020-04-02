import { GroupToken, ParameterToken, StringToken, Token, NoSpaceToken } from '../tokens';
import { Tokenable, Query } from './base';

// TODO: we can probably change this to be an expression.
export class PartialQuery implements Tokenable {
  tokens: Token[] = [];

  constructor(...tokens: Token[]) {
    this.tokens = tokens || [];
  }

  toTokens() {
    return this.tokens;
  }

  private add(partialQuery: PartialQuery | Query<any, any, any>, separator: string) {
    this.tokens.push(new StringToken(separator), ...partialQuery.toTokens());
    return this;
  }

  or(partialQuery: PartialQuery) {
    return this.add(partialQuery, `OR`);
  }

  and(partialQuery?: PartialQuery) {
    this.tokens.push(new StringToken(`AND`));

    if (partialQuery) {
      this.tokens.push(...partialQuery.toTokens());
    }
    return this;
  }

  andNotExists(partialQuery: PartialQuery | Query<any, any, any>) {
    this.tokens.push(new StringToken(`AND NOT EXISTS`), new GroupToken(partialQuery.toTokens()));
    return this;
  }

  andExists(partialQuery: PartialQuery | Query<any, any, any>) {
    this.tokens.push(new StringToken(`AND EXISTS`), new GroupToken(partialQuery.toTokens()));
    return this;
  }

  interval() {
    return this.castTo(`interval`);
  }

  castTo(type: string) {
    // TODO: should we enclose the already existing tokens in a group token so we surround it with
    // ( and ).
    this.tokens.push(new NoSpaceToken(`::${type}`));
    return this;
  }

  minus(string: string | PartialQuery) {
    if (string instanceof PartialQuery) {
      this.tokens.push(new StringToken(`-`), ...string.toTokens());
    } else {
      this.tokens.push(new StringToken(`-`), new ParameterToken(string));
    }

    return this;
  }

  plus(string: string) {
    this.tokens.push(new StringToken(`+`), new ParameterToken(string));
    return this;
  }

  gt(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`>`), ...partialQuery.toTokens());
    return this;
  }

  lt(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`<`), ...partialQuery.toTokens());
    return this;
  }

  gte(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`>=`), ...partialQuery.toTokens());
    return this;
  }

  lte(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`<=`), ...partialQuery.toTokens());
    return this;
  }

  not(partialQuery?: PartialQuery) {
    this.tokens.push(new StringToken(`NOT`));
    if (partialQuery) {
      this.tokens.push(...partialQuery.toTokens());
    }
    return this;
  }

  in(object: any[] | PartialQuery | Query<any, any, any>) {
    if (object instanceof PartialQuery) {
      this.tokens.push(new StringToken(`IN`), new GroupToken(object.tokens));
    } else if (object instanceof Query) {
      this.tokens.push(new StringToken(`IN`), new GroupToken(object.toTokens()));
    } else {
      this.tokens.push(new StringToken(`IN`), new GroupToken([new ParameterToken(object)]));
    }
    return this;
  }

  // TODO: Move this to an order by query.
  nullsFirst() {
    this.tokens.push(new StringToken(`NULLS FIRST`));
    return this;
  }

  nullsLast() {
    this.tokens.push(new StringToken(`NULLS LAST`));
    return this;
  }
}
