import * as pg from 'pg';
import { Column } from './columns';
import { PartialQuery, Query, Tokenable } from './query';
import { TableWrapper } from './table';
import { StringToken } from './tokens';
import { Transaction } from './transaction';
import { Unsafe } from './unsafe';
export interface TableMap {
    [tableName: string]: any;
}
export interface DatabaseConfig {
    min?: number;
    max?: number;
}
export declare class Database {
    pool: pg.Pool;
    tableNames: string[];
    private createPool(databaseUrl, options);
    constructor(tableNames: string[]);
    sql(strings: TemplateStringsArray, ...parameters: any[]): Promise<pg.QueryResult>;
    transaction(callback: (transaction: Transaction) => Promise<any> | void): Promise<void>;
    exec(text: string, parameters?: any[]): Promise<pg.QueryResult>;
    now(): PartialQuery;
    default(): Default;
    uuidGenerateV4(): Unsafe;
    excluded(_column: Column<any>): void;
    exists(_query: Query<any, any, any, any>): void;
    not(tokenable: Tokenable): PartialQuery;
}
export declare abstract class Keyword {
    abstract toString(): string;
    toTokens(): StringToken[];
}
export declare class Default extends Keyword {
    toString(): string;
}
export declare const createDatabase: <T extends TableMap>(tables: T) => Database & {
    [P in keyof T]: T[P] & TableWrapper<{
        [C in keyof T[P]]: T[P][C]["selectType"];
    }, {
        [C in keyof T[P]]: T[P][C]["insertType"];
    }, {
        [C in keyof T[P]]: T[P][C]["updateType"];
    }>;
};
