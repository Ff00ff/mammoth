import { State, Token } from './token';

import { Table } from '../TableType';
import { wrapQuotes } from '../naming';

export class TableToken extends Token {
  constructor(private readonly table: Table<any, any>) {
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
