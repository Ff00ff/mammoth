import * as pg from 'pg';
import * as url from 'url';
import { Column } from './columns';
import { PartialQuery, Query, Tokenable } from './query';
import { Table, TableWrapper } from './table';
import { GroupToken, StringToken } from './tokens';
import { Transaction } from './transaction';
import { Unsafe } from './unsafe';

// FIXME: any should be replaced by something specific. But specifying Table, which should be the
// right type, breaks functionality. Table adds an index signature which means doing keyof MyTable
// (which extends from Table) returns string instead a type with all keys.
export interface TableMap { [tableName: string]: any }

const createTable = <T extends Table>(table: T, tableName: string) => {
  type Row = { [P in keyof T]: T[P]['selectType'] };
  type InsertRow = { [P in keyof T]: T[P]['insertType'] };
  type UpdateRow = { [P in keyof T]: T[P]['updateType'] };

  const newTable = new TableWrapper<Row, InsertRow, UpdateRow>(table, tableName);

  return newTable as T & TableWrapper<Row, InsertRow, UpdateRow>;
}

export interface DatabaseConfig {
  min?: number;
  max?: number;
}

export class Database<Tables> {
  pool: pg.Pool;
  tableNames: string[];

  private createPool(databaseUrl: string, options: DatabaseConfig): pg.Pool {
		const { auth, hostname, port, pathname } = url.parse(databaseUrl);
		const [ user, password ] = (auth || '').split(':');

		const config = {
			...options,
			user,
			password,
			host: hostname,
			port: parseInt(port || '5432', 10),
			database: (pathname || '').slice(1),
			ssl: process.env.DB_DISABLE_SSL !== 'true',
    };

		return new pg.Pool(config);
  }

  constructor(tableNames: string[]) {
    if (!process.env.DATABASE_URL) {
      throw new Error(`DATABASE_URL is not set.`);
    }

    this.pool = this.createPool(String(process.env.DATABASE_URL), {
      min: process.env.DB_MIN_POOL_SIZE
        ? parseInt(process.env.DB_MIN_POOL_SIZE!, 10)
        : undefined,
      max: process.env.DB_MAX_POOL_SIZE
        ? parseInt(process.env.DB_MAX_POOL_SIZE!, 10)
        : undefined,
    });
    this.tableNames = tableNames;
  }

  sql(strings: TemplateStringsArray, ...parameters: any[]) {
    const text = strings.reduce((query, string, index) => query + string + (index < parameters.length
      ? `$${String(index + 1)}`
      : ``), ``);

    return this.exec(text, parameters);
  }

  async transaction(callback: (transaction: Transaction & Tables) => Promise<any> | void) {
    const client = await this.pool.connect();
    const transaction: Transaction & Tables = new Transaction(client) as any;

    try {
      await transaction.begin();

      await Promise.resolve(callback(transaction));

      await transaction.commit();

      client.release();
    }
    catch (e) {
      try {
        await transaction.rollback();
      }
      catch (e2) {
        // If rollback fails we assume this client is bugged and we don't want to give it back
        // to the pool. By passing in the error we effectively tell the pool to disconnect and
        // forget about the client.
        client.release(e2);
      }

      client.release();
    }
  }

  async exec(text: string, parameters: any[] = []) {
    let client: pg.Client | undefined;

		try {
			client = await this.pool.connect();

      const result = await client.query(text, parameters);

			return result;
		}
		catch (e) {
      e.query = text;

			throw e;
		}
		finally {
			if (client) {
				client.release();
			}
		}
  }

  now() {
    const query = new PartialQuery();
    query.tokens.push(new StringToken(`NOW()`));
    return query;
  }

  default() {
    return new Default();
  }

  uuidGenerateV4() {
    return new Unsafe(`uuid_generate_v4()`);
  }

  excluded(_column: Column<any>) {
    //
  }

  exists(_query: Query<any, any, any, any>) {
    //
  }

  not(tokenable: Tokenable) {
    return new PartialQuery(
      new StringToken(`NOT`),
      new GroupToken(tokenable.tokens),
    );
  }
}

export abstract class Keyword {
  abstract toString(): string;

  toTokens() {
    return [
      new StringToken(this.toString()),
    ];
  }
}
export class Default extends Keyword {
  toString() { return `DEFAULT`; }
}

export class UuidGenerateV4 extends Keyword {
  toString() { return `uuid_generate_v4()`; }
}

export class Now extends Keyword {
  toString() { return `NOW()`; }
}

export class CurrentTimestamp extends Keyword {
  toString() { return `CURRENT_TIMESTAMP`; }
}

export const createDatabase = <T extends TableMap>(tables: T) => {
  const tableNames = Object.keys(tables) as (keyof T)[];

  type State = {
    [P in keyof T]: T[P] & TableWrapper<{
      [C in keyof T[P]]: T[P][C]['selectType'];
    }, {
      [C in keyof T[P]]: T[P][C]['insertType'];
    }, {
      [C in keyof T[P]]: T[P][C]['updateType'];
    }>
  };

  const database: Database<State> & State = new Database<State>(tableNames) as any;

  tableNames.forEach(tableName => {
    const table = tables[tableName];

    database[tableName] = createTable(table, tableName);
  });

  tableNames.forEach(tableName => {
    const table: TableWrapper<any> = database[tableName];
    table.init(database);
  });

  return database as Database<State> & State;
}