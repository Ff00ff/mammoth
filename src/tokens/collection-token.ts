import { State, Token, createQueryState } from './token';

import type { Table } from '../TableType';

export class CollectionToken extends Token {
  tokens: Token[];

  constructor(tokens: Token[]) {
    super();

    this.tokens = tokens;
  }

  reduce(state: State, numberOfParameters: number, tables: Table<any, any>[]) {
    const tokensState = createQueryState(this.tokens, numberOfParameters, tables);
    state.parameters.push(...tokensState.parameters);
    state.text.push(...tokensState.text);
    return state;
  }
}
