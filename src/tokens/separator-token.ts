import { State, Token, createQueryState } from './token';

import type { AnyTable } from '../TableType';

export type Separator = ',';

export class SeparatorToken extends Token {
  separator: Separator;
  tokens: Token[];

  constructor(separator: Separator, tokens: Token[]) {
    super();

    this.separator = separator;
    this.tokens = tokens;
  }

  reduce(state: State, numberOfParameters: number, tables: AnyTable[]) {
    const length = this.tokens.length;
    let parameterIndex = numberOfParameters;
    this.tokens.forEach((token, index) => {
      const last = index === length - 1;
      const tokenState = createQueryState([token], parameterIndex, tables);

      if (tokenState.text.length > 0) {
        if (!last) {
          tokenState.text[tokenState.text.length - 1] += this.separator;
        }
      }

      state.text.push(...tokenState.text);
      state.parameters.push(...tokenState.parameters);
      parameterIndex += tokenState.parameters.length;
    });
    return state;
  }
}
