import { CollectionToken, GroupToken, StringToken, Token } from './tokens';

import { Expression } from './expression';
import { Query } from './query';

// A condition is a combination of expressions and operators that evaluates to true, false or unknown.
export interface Condition {
  or(condition: Condition): Condition;
  and(condition: Condition): Condition;
  andNotExists(expression: Expression<any, any, any> | Query<any>): Condition;
  andExists(expression: Expression<any, any, any> | Query<any>): Condition;

  /** @internal */
  toTokens(includeAlias?: boolean): Token[];
}

export const makeCondition = (tokens: Token[]): Condition => {
  const toGroup = (e: Condition | Expression<any, any, any> | Query<any>) => {
    const newTokens = e.toTokens();

    // Anything above 3 means we need to start grouping this in ( and ).
    if (newTokens.length > 3) {
      return new GroupToken(newTokens);
    }

    return new CollectionToken(newTokens);
  };

  return {
    or(condition) {
      return makeCondition([...tokens, new StringToken(`OR`), toGroup(condition)]);
    },

    and(condition) {
      return makeCondition([...tokens, new StringToken(`AND`), toGroup(condition)]);
    },

    andNotExists(expression) {
      return makeCondition([...tokens, new StringToken(`AND NOT EXISTS`), toGroup(expression)]);
    },

    andExists(expression) {
      return makeCondition([...tokens, new StringToken(`AND EXISTS`), toGroup(expression)]);
    },

    toTokens() {
      return tokens;
    },
  };
};
