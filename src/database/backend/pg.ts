import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import { Backend, QueryResult } from './backend';

export {
  PoolClient
};

type Options = StandardOptions | SharedPoolOptions | TransactionOptions;

export interface StandardOptions {
  debug?: boolean;
  connectionString: string;
  pool?: never;
  client?: never;
}

export interface SharedPoolOptions {
  debug?: boolean;
  pool: Pool;
  connectionString?: never;
  client?: never;
}

interface TransactionOptions {
  client: PoolClient;
  debug?: boolean;
}

export class PgBackend implements Backend {
  private client!: Pool | PoolClient;
  private debug!: boolean;

  private init(options: Options) {
    if (!options.client && options.pool) {
      this.client = options.pool;
    } else if(!options.client && options.connectionString){
    this.client = new Pool({connectionString: options.connectionString});
    }else if(options.client){
      this.client = options.client;
    }

    //assert that client is set?
    this.debug = options.debug || false;
  }

  constructor(options: string | Options | Pool) {
    if (typeof options === `string`) {
      this.init({
        debug: false,
        connectionString: options,
      });
    } else if (("connectionString" in options) || ("pool" in options) || ("client" in options)) {
      this.init(options)
    }else {
      this.init({
        debug: false,
        pool: options
      });
    }
  }

  async query<T>(text: string, parameters?: any[]): Promise<QueryResult<T>> {
    if (this.debug) {
      console.log(text, parameters);
    }

    const result = await this.client.query(text, parameters);

    return {
      rows: result.rows,
      count: result.rowCount,
    };
  }

  async destroy() {
    if (`end` in this.client) {
      await this.client.end();
    }
  }

  async transaction<T>(callback: (backend: Backend) => Promise<T>): Promise<T> {
    if (`release` in this.client) {
      // Because the client has a release we assume this is an existing pool client. This means
      // we're already inside a transaction so we just invoke the callback.
      return Promise.resolve(callback(this));
    }

    const client = await this.client.connect();

    try {
      await client.query(`BEGIN`);

      const backend = new PgBackend({ client });
      const result = await Promise.resolve(callback(backend));

      await client.query(`COMMIT`);
      return result;
    } catch (e) {
      await client.query(`ROLLBACK`);

      throw e;
    } finally {
      client.release();
    }
  }
}
