import { State, Token, createQueryState } from './token';

import { CollectionToken } from './collection-token';
import { Column } from '../column';
import { SeparatorToken } from './separator-token';
import type { Table } from '../TableType';

export class AllStarToken extends Token {
  constructor() {
    super();
  }

  reduce(state: State, numberOfParameters: number, tables: Table<any, any>[]) {
    const tokens = tables.flatMap((table) => {
      return Object.keys(table)
        .filter((name) => ![`as`, `getName`, `getOriginalName`].includes(name))
        .map((columnName) => table[columnName])
        .map((column) => {
          return new CollectionToken(
            (column as Column<any, any, any, any, any, any>).toTokens(true),
          );
        });
    });
    const newState = createQueryState([new SeparatorToken(',', tokens)], numberOfParameters);
    state.text.push(...newState.text);
    state.parameters.push(...newState.parameters);
    return state;
  }
}
