import { Column } from './columns';
import { Database } from './database';
import { PartialQuery, Query } from './query';
export declare class Table {
    [columnName: string]: Column<any>;
}
export declare class TableWrapper<Row, InsertRow = Row, UpdateRow = Row> {
    private readonly $name;
    private readonly $columnNames;
    private $db?;
    constructor(table: Table, name: string);
    init(db: Database): void;
    getColumns(): Column<any, any, any, any>[];
    getColumn(columnName: string): Column<any> | undefined;
    /** @internal */
    getName(): string;
    /** @internal */
    getDb(): Database | undefined;
    private query();
    select<SelectMap extends {
        [alias: string]: Column<any, any, string | number | Date | null, any>;
    }>(columns: SelectMap): Query<this, Row, InsertRow, UpdateRow, {
        [P in keyof SelectMap]: SelectMap[P]['selectType'];
    }[]>;
    select<A extends keyof Row>(columnNameA: A): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    })[]>;
    select<A extends keyof Row, B extends keyof Row>(columnNameA: A, columnNameB: B): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    })[]>;
    select<A extends keyof Row, B extends keyof Row, C extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    })[]>;
    select<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    } & {
        [PD in D]: Row[PD];
    })[]>;
    select<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    } & {
        [PD in D]: Row[PD];
    } & {
        [PE in E]: Row[PE];
    })[]>;
    select<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E, columnNameF: F): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    } & {
        [PD in D]: Row[PD];
    } & {
        [PE in E]: Row[PE];
    } & {
        [PF in F]: Row[PF];
    })[]>;
    select<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row, G extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E, columnNameF: F, columnNameG: G): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    } & {
        [PD in D]: Row[PD];
    } & {
        [PE in E]: Row[PE];
    } & {
        [PF in F]: Row[PF];
    } & {
        [PG in G]: Row[PG];
    })[]>;
    select<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row, G extends keyof Row, H extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E, columnNameF: F, columnNameG: G, columnNameH: H): Query<this, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    } & {
        [PD in D]: Row[PD];
    } & {
        [PE in E]: Row[PE];
    } & {
        [PF in F]: Row[PF];
    } & {
        [PG in G]: Row[PG];
    } & {
        [PH in H]: Row[PH];
    })[]>;
    object(object: InsertRow): InsertRow;
    insert(object: InsertRow): Query<this, Row, InsertRow, UpdateRow, number>;
    update(object: {
        [P in keyof UpdateRow]?: UpdateRow[P] | PartialQuery;
    }): Query<this, Row, InsertRow, UpdateRow, void>;
}
