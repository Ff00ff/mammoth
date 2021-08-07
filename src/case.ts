import { BooleanQuery, Query } from './query';
import { Expression, InternalExpression } from './expression';
import { ParameterToken, StringToken, Token } from './tokens';

import { DbConfig } from './config';

export class CaseStatement<Config extends DbConfig, DataType> {
  constructor(private readonly tokens: Token[]) {}

  when<Q extends Query<any>>(
    expression: Expression<Config, boolean, boolean, string> | BooleanQuery<Config, Q>,
  ) {
    const self = this;
    return {
      then<T>(result: T) {
        return new CaseStatement<Config, DataType | T>([
          ...self.tokens,
          new StringToken(`WHEN`),
          ...expression.toTokens(),
          new StringToken(`THEN`),
          new ParameterToken(result),
        ]);
      },
    };
  }

  else<T>(result: T) {
    return new CaseStatement<Config, DataType | T>([
      ...this.tokens,
      new StringToken(`ELSE`),
      new ParameterToken(result),
    ]);
  }

  end(): Expression<Config, DataType, true, 'case'> {
    return new InternalExpression(this.tokens, `case`) as any;
  }
}
