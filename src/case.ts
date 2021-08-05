import { BooleanQuery, Query } from './query';
import { Expression, InternalExpression } from './expression';
import { ParameterToken, StringToken, Token } from './tokens';

export class CaseStatement<DataType> {
  constructor(private readonly tokens: Token[]) {}

  when<Q extends Query<any>>(expression: Expression<boolean, boolean, string> | BooleanQuery<Q>) {
    const self = this;
    return {
      then<T>(result: T) {
        return new CaseStatement<DataType | T>([
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
    return new CaseStatement<DataType | T>([
      ...this.tokens,
      new StringToken(`ELSE`),
      new ParameterToken(result),
    ]);
  }

  end(): Expression<DataType, true, 'case'> {
    return new InternalExpression(this.tokens, `case`) as any;
  }
}
