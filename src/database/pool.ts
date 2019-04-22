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
  databaseName?: string;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export class PoolDatabase<Tables extends TableMap> extends Database<Tables> {
  protected pool?: pg.Pool;
  protected databaseUrl: string;

  private createPool(options: DatabaseConfig): pg.Pool {
    const { auth, hostname, port, pathname } = url.parse(this.databaseUrl);
    const [user, password] = (auth || '').split(':');

    const config = {
      ...options,
      user,
      password,
      host: hostname,
      port: parseInt(port || '5432', 10),
      database: options.databaseName || (pathname || '').slice(1),
      ssl:
        process.env.NODE_ENV !== `test` &&
        !process.env.MAMMOTH_DISABLE_SSL &&
        process.env.PGSSLROOTCERT
          ? {
              sslmode: 'verify-full',
              sslrootcert: process.env.PGSSLROOTCERT,
            }
          : false,
    };

    return new pg.Pool(config as any);
  }

  constructor(databaseUrl: string, tables: Tables) {
    super(tables);

    this.databaseUrl = databaseUrl;
    this.pool = this.createPool({
      min: process.env.DB_MIN_POOL_SIZE ? parseInt(process.env.DB_MIN_POOL_SIZE!, 10) : undefined,
      max: process.env.DB_MAX_POOL_SIZE ? parseInt(process.env.DB_MAX_POOL_SIZE!, 10) : undefined,
    });
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      const pool = this.pool;
      this.pool = undefined;
      await pool.end();
    }
  }

  async reconnect(databaseName: string): Promise<void> {
    let previousPool = this.pool;

    this.pool = this.createPool({
      min: process.env.DB_MIN_POOL_SIZE ? parseInt(process.env.DB_MIN_POOL_SIZE!, 10) : undefined,
      max: process.env.DB_MAX_POOL_SIZE ? parseInt(process.env.DB_MAX_POOL_SIZE!, 10) : undefined,
      databaseName,
    });

    if (previousPool) {
      await previousPool.end();
    }
  }

  async transaction<
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore

  // TODO: we now assume id is always present and is always a not null default construct. We
  // probably should omit all default types. We're doing this to make sure you can insert
  // rows without specifying a id prop in the Query#values() method.
    Ret,
    State = {
      [TableName in keyof Tables]: TableWrapper<
        { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['selectType'] },
        Omit<
          { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['insertType'] },
          'id'
        > & { id?: Tables[TableName]['id']['insertType'] },
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
  >(callback: (db: TransactionDatabase<Tables> & State) => Promise<Ret>): Promise<Ret> {
    if (!this.pool) {
      throw new Error(
        `The database is not connected. Did you call disconnect() but not reconnect()?`,
      );
    }

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

      throw e;
    }
  }

  async exec(text: string, parameters: any[] = []) {
    if (!this.pool) {
      throw new Error(
        `The database is not connected. Did you call disconnect() but not reconnect()?`,
      );
    }

    let client: pg.PoolClient | undefined;

    try {
      client = await this.pool.connect();

      const result = await client.query(text, parameters);

      return result;
    } catch (e) {
      e.query = text;

      // if (!e.message || e.message.indexOf('schema "db" already exists')) {
      //   console.log(e);
      // }

      throw e;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async destroy() {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
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
      { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['selectType'] },
      Omit<
        { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['insertType'] },
        'id'
      > & { id?: Tables[TableName]['id']['insertType'] },
      { [ColumnName in keyof Tables[TableName]]: Tables[TableName][ColumnName]['updateType'] }
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
  databaseUrl: string,
  tables: Tables,
): State & PoolDatabase<Tables> => {
  const database = new PoolDatabase(databaseUrl, tables);
  return extendDatabase<State, Tables, PoolDatabase<Tables>>(tables, database);
};
