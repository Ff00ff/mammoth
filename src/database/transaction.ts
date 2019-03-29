import * as pg from 'pg';
import { Database } from '.';
import { ColumnWrapper } from '../columns';
import { TableWrapper } from '../table';

export interface TableMap {
  [tableName: string]: any;
}

export class TransactionDatabase<Tables extends TableMap> extends Database<Tables> {
  private $client: pg.PoolClient;

  constructor(tables: Tables, client: pg.PoolClient) {
    super(tables);

    this.$client = client;
  }

  sql(strings: TemplateStringsArray, ...parameters: any[]) {
    const text = strings.reduce(
      (query, string, index) =>
        query + string + (index < parameters.length ? `$${String(index + 1)}` : ``),
      ``,
    );

    return this.exec(text, parameters);
  }

  async reconnect(_databaseName: string) {
    throw new Error(`Reconnect to another database is not supported in a transaction database.`);
  }

  async disconnect() {
    throw new Error(`Disconnect is not implemented in transaction database`);
  }

  async exec(text: string, parameters: any[] = []) {
    try {
      const result = await this.$client.query(text, parameters);

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
    // TODO: in here the transaction is already started, so we can't call BEGIN, COMMIT and
    // ROLLBACK (or can we ?). Instead we should use SAVEPOINT and ROLLBACK TO SAVEPOINT. But maybe
    // this isn't even neccesary.
    return Promise.resolve(callback(this as any));
  }
}
