import * as pg from 'pg';
import { Database } from '.';
import { ColumnWrapper } from '../columns';
import { TableWrapper } from '../table';

export interface TableMap {
  [tableName: string]: any;
}

export class TransactionDatabase<Tables extends TableMap> extends Database<Tables> {
  private client: pg.PoolClient;

  constructor(tables: Tables, client: pg.PoolClient) {
    super(tables);

    this.client = client;
  }

  async exec(text: string, parameters: any[] = []) {
    try {
      const result = await this.client.query(text, parameters);

      return result;
    } catch (e) {
      e.query = text;

      throw e;
    }
  }

  async destroy(): Promise<void> {
    return Promise.resolve(void 0);
  }

  async transaction<
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
    Ret,
    State = {
      [TableName in keyof Tables]: TableWrapper<
        { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['selectType'] },
        { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['insertType'] },
        { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['updateType'] }
      > &
        {
          [ColumnName in keyof Tables[TableName]]: ColumnWrapper<
            ColumnName,
            Tables[TableName][ColumnName]['type'],
            Tables[TableName][ColumnName]['selectType'],
            Tables[TableName][ColumnName]['insertType'],
            Tables[TableName][ColumnName]['updateType']
          >
        }
    }
  >(callback: (db: TransactionDatabase<Tables> & State) => Promise<Ret>): Promise<Ret | undefined> {
    // FIXME: in here the transaction is already started, so we can't call BEGIN (= start
    // transaction) again. If we want something like that we should use savepoints.

    // SAVEPOINT :string & ROLLBACK TO SAVEPOINT :string.

    return Promise.resolve(callback(this as any));
  }
}
