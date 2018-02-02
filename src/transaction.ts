import * as pg from 'pg';

export class Transaction {
  private client: pg.Client;

  constructor(client: pg.Client) {
    this.client = client;
  }

  begin() {
    return this.client.query(`BEGIN`);
  }

  commit() {
    return this.client.query(`COMMIT`);
  }

  rollback() {
    return this.client.query(`ROLLBACK`);
  }
}