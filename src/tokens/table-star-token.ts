import { State, Token, createQueryState } from './token';

import { CollectionToken } from './collection-token';
import { AnyColumn } from '../column';
import { SeparatorToken } from './separator-token';
import type { AnyTable } from '../TableType';

export class TableStarToken extends Token {
  constructor(private readonly table: AnyTable) {
    super();
  }

  reduce(state: State, numberOfParameters: number) {
    const newState = createQueryState(
      [
        new SeparatorToken(
          ',',
          Object.keys(this.table)
            .filter((name) => ![`as`, `getName`, `getOriginalName`].includes(name))
            .map((columnName) => this.table[columnName])
            .map((column) => {
              return new CollectionToken((column as AnyColumn).toTokens(true));
            }),
        ),
      ],
      numberOfParameters,
    );
    state.text.push(...newState.text);
    state.parameters.push(...newState.parameters);
    return state;
  }
}
