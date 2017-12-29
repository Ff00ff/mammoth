import { Default } from '../database';
import { PartialQuery } from '../query';
import { TableWrapper } from '../table';
import { Unsafe } from '../unsafe';
export interface ColumnConfig<T> {
    primary?: boolean;
    default?: T | string;
    check?: string;
    notNull?: boolean;
    unique?: boolean;
    references?: {
        tableName: string;
        columnName: string;
    };
    columnFunction?: ColumnFunction<T, any>;
}
export declare type ColumnFunction<T, Db> = (db: Db) => Column<T, any, any, any>;
export declare type AggregateType = 'COUNT' | 'MIN' | 'MAX' | 'AVG' | 'SUM';
export declare class Column<T, IT = T | null, ST = T | null, UT = T> {
    dataType: string;
    /** @internal */
    type: T;
    /** @internal */
    insertType: IT;
    /** @internal */
    selectType: ST;
    /** @internal */
    updateType: UT;
    /** @internal */
    name?: string;
    /** @internal */
    key?: string;
    /** @internal */
    table?: TableWrapper<any>;
    config: ColumnConfig<T>;
    constructor(name?: string, config?: {});
    /** @internal */
    getName(): string | undefined;
    /** @internal */
    setName(name: string): void;
    /** @internal */
    setKey(key: string): void;
    /** @internal */
    setTable<TW extends TableWrapper<any>>(table: TW): void;
    primary(): Column<T, T | null, T>;
    primaryKey(): Column<T, T | null, T, T>;
    unique(): this;
    notNull(): Column<T, T, T>;
    check(sql: string): this;
    default(sql: T | Unsafe): Column<T, T | null, ST, UT | Default>;
    /** @internal */
    createReference<Db>(db: Db): void;
    references<Db>(columnFunction: ColumnFunction<T, Db>): this;
    private compare(value, comparator);
    isNull(): PartialQuery;
    isNotNull(): PartialQuery;
    asc(): PartialQuery;
    desc(): PartialQuery;
    in(array: T[]): PartialQuery;
    private aggregate(aggregateType);
    count(): AggregateColumn<T, IT, ST, UT>;
    sum(): AggregateColumn<T, IT, ST, UT>;
    min(): AggregateColumn<T, IT, ST, UT>;
    max(): AggregateColumn<T, IT, ST, UT>;
    avg(): AggregateColumn<T, IT, ST, UT>;
    private operate(operator, value);
    plus(value: T): PartialQuery;
    minus(value: T): PartialQuery;
    multiply(value: T): PartialQuery;
    divide(value: T): PartialQuery;
    modulo(value: T): PartialQuery;
    concat(value: T | Column<any>): PartialQuery;
    between(a: T, b: T): PartialQuery;
    eq(value: T | Column<any> | PartialQuery): PartialQuery;
    ne(value: T | Column<any> | PartialQuery): PartialQuery;
    gt(value: T | Column<any> | PartialQuery): PartialQuery;
    gte(value: T | Column<any> | PartialQuery): PartialQuery;
    lt(value: T | Column<any> | PartialQuery): PartialQuery;
    lte(value: T | Column<any> | PartialQuery): PartialQuery;
}
export declare class AggregateColumn<T, IT, ST, UT> extends Column<T, IT, ST, UT> {
    aggregateType: string;
    constructor(aggregateType: string, name: string, key: string);
}
export declare class TextColumn extends Column<string> {
    dataType: string;
}
export declare class CitextColumn extends Column<string> {
    dataType: string;
}
export declare class CaseInsensitiveTextColumn extends CitextColumn {
}
export declare class IntegerColumn extends Column<number> {
    dataType: string;
}
export declare class DecimalColumn extends Column<number> {
    dataType: string;
}
export declare class SerialColumn extends Column<number, number | null> {
    dataType: string;
}
export declare class JSONColumn<T> extends Column<T> {
    dataType: string;
}
export declare class JSONBColumn<T> extends Column<T> {
    dataType: string;
}
export declare class TimestampWithTimeZoneColumn extends Column<Date> {
    dataType: string;
}
export declare class TimestampWithoutTimeZoneColumn extends Column<Date> {
    dataType: string;
}
export declare type Uuid = string;
export declare class UuidColumn extends Column<Uuid> {
    dataType: string;
}
export declare class StringColumn extends TextColumn {
}
export declare class NumberColumn extends IntegerColumn {
}
export declare class DateColumn extends TimestampWithTimeZoneColumn {
}
