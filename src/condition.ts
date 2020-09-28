import { StringToken, Token } from "./tokens";

// A condition is a combination of expressions and operators that evaluates to true, false or unknown.
export interface Condition {
  or(condition: Condition): Condition;
  and(condition: Condition): Condition;
  andNotExists(condition: Condition): Condition;
  andExists(condition: Condition): Condition;
  not(condition: Condition): Condition;

  /** @internal */
  toTokens(includeAlias?: boolean): Token[];
}

export const makeCondition = (tokens: Token[]): Condition => {
  return {
    or(condition) {
      return makeCondition([...tokens, new StringToken(`OR`), ...condition.toTokens()]);
    },

    and(condition) {
      return makeCondition([...tokens, new StringToken(`AND`), ...condition.toTokens()]);
    },

    andNotExists(condition) {
      return makeCondition([...tokens, new StringToken(`AND NOT EXISTS`), ...condition.toTokens()]);
    },

    andExists(condition) {
      return makeCondition([...tokens, new StringToken(`AND EXISTS`), ...condition.toTokens()]);
    },

    not(condition) {
      return makeCondition([...tokens, new StringToken(`NOT`), ...condition.toTokens()]);
    },

    toTokens() {
      return tokens;
    },
  };
};