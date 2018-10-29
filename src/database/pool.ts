import * as pg from 'pg';
import * as url from 'url';
import { Database, TableMap } from '.';
import { ColumnWrapper } from '..';
import { Table, TableWrapper } from '../table';
import { Transaction } from '../transaction';
import { TransactionDatabase } from './transaction';

export interface DatabaseConfig {
  min?: number;
  max?: number;
}
export class PoolDatabase<Tables extends TableMap> extends Database<Tables> {
  protected pool: pg.Pool;

  private createPool(databaseUrl: string, options: DatabaseConfig): pg.Pool {
    const { auth, hostname, port, pathname } = url.parse(databaseUrl);
    const [user, password] = (auth || '').split(':');

    const config = {
      ...options,
      user,
      password,
      host: hostname,
      port: parseInt(port || '5432', 10),
      database: (pathname || '').slice(1),
      ssl: process.env.MAMMOTH_DISABLE_SSL !== 'true',
    };

    return new pg.Pool(config);
  }

  constructor(tables: Tables) {
    super(tables);

    if (!process.env.DATABASE_URL) {
      throw new Error(`DATABASE_URL is not set.`);
    }

    this.pool = this.createPool(String(process.env.DATABASE_URL), {
      min: process.env.DB_MIN_POOL_SIZE ? parseInt(process.env.DB_MIN_POOL_SIZE!, 10) : undefined,
      max: process.env.DB_MAX_POOL_SIZE ? parseInt(process.env.DB_MAX_POOL_SIZE!, 10) : undefined,
    });
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
    const client = await this.pool.connect();

    // TODO: with the new syntax/style, we're not using the table as
    // the entry point for a query anymore. Maybe we can avoid copying
    // the table wrappers on the db again but just reference them from
    // the original db?
    const transaction = new Transaction(client);
    const database = new TransactionDatabase(this.tables, client);
    const db = extendDatabase<State, Tables, TransactionDatabase<Tables>>(this.tables, database);

    try {
      await transaction.begin();

      const result = await Promise.resolve(callback(db));

      await transaction.commit();

      client.release();

      return result;
    } catch (e) {
      try {
        await transaction.rollback();

        client.release();
      } catch (e) {
        // If rollback fails we assume this client is bugged and we don't want to give it back
        // to the pool. By passing in the error we effectively tell the pool to disconnect and
        // forget about the client.
        client.release(e);
      }

      return undefined;
    }
  }

  async exec(text: string, parameters: any[] = []) {
    let client: pg.PoolClient | undefined;

    try {
      client = await this.pool.connect();

      const result = await client.query(text, parameters);

      return result;
    } catch (e) {
      e.query = text;

      throw e;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async destroy() {
    await this.pool.end();
  }
}

const createTable = <T extends Table>(table: T, tableName: string) => {
  type Row = { [P in keyof T]: T[P]['selectType'] };
  type InsertRow = { [P in keyof T]: T[P]['insertType'] };
  type UpdateRow = { [P in keyof T]: T[P]['updateType'] };

  return new TableWrapper<Row, InsertRow, UpdateRow>(table, tableName);
};

export const extendDatabase = <State, Tables extends TableMap, D extends Database<any>>(
  tables: Tables,
  database: D,
): D & State => {
  const db = database as any;
  const tableNames = Object.keys(tables) as (keyof Tables)[];

  tableNames.forEach(tableName => {
    const table = tables[tableName];

    db[tableName] = createTable(table, tableName as string);
  });

  tableNames.forEach(tableName => {
    const table: TableWrapper<any> = db[tableName];
    table.init(database);
  });

  return db;
};

export const createDatabase = <
  Tables extends TableMap,
  State = {
    [TableName in keyof Tables]: TableWrapper<
      {
        // @ts-ignore
        [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['selectType']
      },
      {
        // @ts-ignore
        [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['insertType']
      },
      {
        // @ts-ignore
        [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['updateType']
      }
    > &
      {
        [ColumnName in keyof Tables[TableName]]: ColumnWrapper<
          ColumnName,
          // @ts-ignore
          Tables[TableName][ColumnName]['type'],
          // @ts-ignore
          Tables[TableName][ColumnName]['selectType'],
          // @ts-ignore
          Tables[TableName][ColumnName]['insertType'],
          // @ts-ignore
          Tables[TableName][ColumnName]['updateType']
        >
      }
  }
>(
  tables: Tables,
): State & PoolDatabase<Tables> => {
  const database = new PoolDatabase(tables);
  return extendDatabase<State, Tables, PoolDatabase<Tables>>(tables, database);
};
