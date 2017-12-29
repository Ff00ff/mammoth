import * as pg from 'pg';
export declare class Transaction {
    private client;
    constructor(client: pg.Client);
    sql(strings: TemplateStringsArray, ...parameters: any[]): Promise<pg.QueryResult>;
    begin(): Promise<pg.QueryResult>;
    commit(): Promise<pg.QueryResult>;
    rollback(): Promise<pg.QueryResult>;
}
