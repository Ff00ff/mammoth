import { CollectionToken, GroupToken, StringToken, Token } from "./tokens";

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
  const toGroup = (c: Condition) => {
    const newTokens = c.toTokens();

    // Anything above 3 means we need to start grouping this in ( and ).
    if (newTokens.length > 3) {
      return new GroupToken(newTokens);
    }

    return new CollectionToken(newTokens);
  }

  return {
    or(condition) {
      return makeCondition([...tokens, new StringToken(`OR`), toGroup(condition)]);
    },

    and(condition) {
      return makeCondition([...tokens, new StringToken(`AND`), toGroup(condition)]);
    },

    andNotExists(condition) {
      return makeCondition([...tokens, new StringToken(`AND NOT EXISTS`), toGroup(condition)]);
    },

    andExists(condition) {
      return makeCondition([...tokens, new StringToken(`AND EXISTS`), toGroup(condition)]);
    },

    not(condition) {
      return makeCondition([...tokens, new StringToken(`NOT`), toGroup(condition)]);
    },

    toTokens() {
      return tokens;
    },
  };
};