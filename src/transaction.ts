import * as pg from 'pg';

export class Transaction {
  private client: pg.Client;

  constructor(client: pg.Client) {
    this.client = client;
  }

  sql(strings: TemplateStringsArray, ...parameters: any[]) {
    const text = strings.reduce((query, string, index) => query + String(index + 1) + string, '');

    try {
      return this.client.query(text, parameters);
    }
    catch (e) {
      e.query = text;
      throw e;
    }
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