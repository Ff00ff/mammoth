import { Database } from '../database';
import { Table } from '../table';
import { Tokenable } from './base';
import { InsertQuery } from './insert';

export class UpsertQuery<
  Db extends Database<any>,
  T extends Table<Row, InsertRow, UpdateRow>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet
> extends InsertQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet> {
  where(tokenable: Tokenable) {
    return this.internalWhere(tokenable);
  }
}
