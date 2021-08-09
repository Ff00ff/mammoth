import { State, Token, createQueryState } from './token';

import { CollectionToken } from './collection-token';
import { AnyColumn, Column } from '../column';
import { SeparatorToken } from './separator-token';
import type { AnyTable, Table } from '../TableType';

export class AllStarToken extends Token {
  constructor() {
    super();
  }

  reduce(state: State, numberOfParameters: number, tables: AnyTable[]) {
    const tokens = tables.flatMap((table) => {
      return Object.keys(table)
        .filter((name) => ![`as`, `getName`, `getOriginalName`].includes(name))
        .map((columnName) => table[columnName])
        .map((column) => {
          return new CollectionToken((column as AnyColumn).toTokens(true));
        });
    });
    const newState = createQueryState([new SeparatorToken(',', tokens)], numberOfParameters);
    state.text.push(...newState.text);
    state.parameters.push(...newState.parameters);
    return state;
  }
}
