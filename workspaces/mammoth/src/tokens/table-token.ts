import { State, Token } from './token';

import { AnyTable } from '../TableType';
import { wrapQuotes } from '../naming';

export class TableToken extends Token {
  constructor(private readonly table: AnyTable) {
    super();
  }

  reduce(state: State) {
    if (this.table.getOriginalName()) {
      state.text.push(
        `${wrapQuotes(this.table.getOriginalName())} ${wrapQuotes(this.table.getName())}`,
      );
    } else {
      state.text.push(wrapQuotes(this.table.getName()));
    }

    return state;
  }

  getTable() {
    return this.table;
  }
}
