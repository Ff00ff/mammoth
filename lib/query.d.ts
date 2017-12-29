import { Column } from './columns';
import { TableWrapper } from './table';
import { Token } from './tokens';
export interface Tokenable {
    tokens: Token[];
}
export declare class QueryBuilder {
    tokens: Token[];
}
export interface State {
    text: string[];
    parameters: any[];
}
export interface QueryState {
    text: string;
    parameters: any[];
}
export declare const createState: (tokens: Token[], numberOfParameters: number) => State;
export declare type QueryType = 'COUNT' | 'ROWS';
export declare class Query<T extends TableWrapper<Row, InsertRow, UpdateRow>, Row, InsertRow, UpdateRow, Ret = void> {
    tokens: Token[];
    table: T;
    private type;
    constructor(table: T);
    then(onFulfilled?: ((value: Ret) => Ret | PromiseLike<Ret>) | undefined | null, onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null): Promise<void | Ret>;
    toQuery(): QueryState;
    append(strings?: TemplateStringsArray, parameters?: any[]): void;
    selectWithAlias<SelectMap extends {
        [alias: string]: Column<string | number | Date>;
    }>(columns: SelectMap): Query<T, Row, InsertRow, UpdateRow, {
        [P in keyof SelectMap]: SelectMap[P]['selectType'];
    }[]>;
    selectWithStrings<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row, G extends keyof Row, H extends keyof Row>(columnNameA: A, columnNameB?: B, columnNameC?: C, columnNameD?: D, columnNameE?: E, columnNameF?: F, columnNameG?: G, columnNameH?: H): Query<T, Row, InsertRow, UpdateRow, ({
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
    from(table: T): this;
    limit(limit: number | 'ALL'): this;
    offset(offset: number): this;
    innerJoin(table: TableWrapper<any>): this;
    leftJoin(table: TableWrapper<any>): this;
    rightJoin(table: TableWrapper<any>): this;
    leftOuterJoin(table: TableWrapper<any>): this;
    rightOuterJoin(table: TableWrapper<any>): this;
    on(tokenable: Tokenable): this;
    where(tokenable: Tokenable): this;
    private getColumn(key);
    insert(object: InsertRow): Query<T, Row, InsertRow, UpdateRow, number>;
    update(object: {
        [P in keyof UpdateRow]?: UpdateRow[P] | PartialQuery;
    }): this;
    onConflict(...columnNames: (keyof Row)[]): this;
    doNothing(): this;
    doUpdate(object: Partial<UpdateRow>): this;
    having(tokenable: Tokenable): this;
    orderBy(...tokenables: Tokenable[]): this;
    groupBy(...columnNames: (keyof Row | Column<any>)[]): this;
    returning<A extends keyof Row>(columnNameA: A): Query<T, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    })[]>;
    returning<A extends keyof Row, B extends keyof Row>(columnNameA: A, columnNameB: B): Query<T, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    })[]>;
    returning<A extends keyof Row, B extends keyof Row, C extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C): Query<T, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    })[]>;
    returning<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D): Query<T, Row, InsertRow, UpdateRow, ({
        [PA in A]: Row[PA];
    } & {
        [PB in B]: Row[PB];
    } & {
        [PC in C]: Row[PC];
    } & {
        [PD in D]: Row[PD];
    })[]>;
    returning<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E): Query<T, Row, InsertRow, UpdateRow, ({
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
    returning<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E, columnNameF: F): Query<T, Row, InsertRow, UpdateRow, ({
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
    returning<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row, G extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E, columnNameF: F, columnNameG: G): Query<T, Row, InsertRow, UpdateRow, ({
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
    returning<A extends keyof Row, B extends keyof Row, C extends keyof Row, D extends keyof Row, E extends keyof Row, F extends keyof Row, G extends keyof Row, H extends keyof Row>(columnNameA: A, columnNameB: B, columnNameC: C, columnNameD: D, columnNameE: E, columnNameF: F, columnNameG: G, columnNameH: H): Query<T, Row, InsertRow, UpdateRow, ({
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
}
export declare class PartialQuery implements Tokenable {
    tokens: Token[];
    constructor(...tokens: Token[]);
    toTokens(): Token[];
    add(partialQuery: PartialQuery, separator: string): this;
    or(partialQuery: PartialQuery): this;
    and(partialQuery: PartialQuery): this;
    minus(string: string): this;
    plus(string: string): this;
    in(object: any[] | PartialQuery | Query<any, any, any, any>): this;
    nullsFirst(): this;
    nullsLast(): this;
}
export declare class SelectQuery<T extends TableWrapper<Row, InsertRow, UpdateRow>, Row, InsertRow, UpdateRow, Ret = void> extends Query<T, Row, InsertRow, UpdateRow, Ret> {
}
