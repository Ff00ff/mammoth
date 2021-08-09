import { ColumnDefinition, makeColumnDefinition } from './column';

const variableLength = (string: string, ...n: (number | undefined)[]) =>
  n.length > 0 ? `${string}(${n.join(`, `)})` : string;

const makeDataType = makeColumnDefinition;

// If both are not null, the resulting type is also not null. But if any of the type is nullable,
// the result may also be nullable.
export type GetNotNull<Left, Right> = Right extends true
  ? Left extends true
    ? true
    : false
  : false;

export type GetMostSignificantDataType<Left, Right> = Left & Right extends Float8
  ? Float8
  : Left extends Float4
  ? Right extends Float4
    ? Float4
    : Left & Right extends Float4
    ? Float8
    : Left & Right extends Numeric
    ? Numeric
    : Left & Right extends Int8
    ? Int8
    : Int4
  : Left & Right extends Float4
  ? Float8
  : Left & Right extends Numeric
  ? Numeric
  : Left & Right extends Int8
  ? Int8
  : Int4;

type SymbolMapTag = { readonly symbol: unique symbol };

export type Int4 = 'Int4';
export type Int8 = 'Int8';
export type Float4 = 'Float4';
export type Float8 = 'Float8';
export type Numeric = 'Numeric';
export type AnyNumber = Int4 | Int8 | Float4 | Float8 | Numeric;
export type Text = 'Text';
export type Date = 'Date';
export type DateTime = 'DateTime';
export type Any = AnyNumber | Text | Date | DateTime;
export type Uuid<T> = InternalUuid<T>;

export class InternalUuid<T> {
  private _uuidBrand!: ['uuid', T];
}

export type ToPostgresDataType<T extends string> = T extends DateTime
  ? 'timestamptz'
  : Lowercase<T>;

export function dataType<T>(dataType: string) {
  return makeDataType<T>(dataType);
}

export function int8(): ColumnDefinition<Int8>;
export function int8<T>(): ColumnDefinition<T>;
export function int8() {
  return makeDataType(`int8`);
}
export function bigint(): ColumnDefinition<Int8>;
export function bigint<T>(): ColumnDefinition<T>;
export function bigint() {
  return makeDataType(`bigint`);
}

// Serial data types are automatically configured to have a default. This makes sure one does not
// need to explicitly provide a value when inserting.
export function bigserial(): ColumnDefinition<Int8, false, true>;
export function bigserial<T>(): ColumnDefinition<T, false, true>;
export function bigserial() {
  return makeDataType(`bigserial`);
}
export function serial8(): ColumnDefinition<Int8, false, true>;
export function serial8<T>(): ColumnDefinition<T, false, true>;
export function serial8() {
  return makeDataType(`serial8`);
}
export function serial(): ColumnDefinition<Int4, false, true>;
export function serial<T>(): ColumnDefinition<T, false, true>;
export function serial() {
  return makeDataType(`serial`);
}
export function serial4(): ColumnDefinition<Int4, false, true>;
export function serial4<T>(): ColumnDefinition<T, false, true>;
export function serial4() {
  return makeDataType(`serial4`);
}
export function smallserial(): ColumnDefinition<Int4, false, true>;
export function smallserial<T>(): ColumnDefinition<T, false, true>;
export function smallserial() {
  return makeDataType(`smallserial`);
}
export function serial2(): ColumnDefinition<Int4, false, true>;
export function serial2<T>(): ColumnDefinition<T, false, true>;
export function serial2() {
  return makeDataType(`serial2`);
}

export function bit(n?: number): ColumnDefinition<string>;
export function bit<T>(n?: number): ColumnDefinition<T>;
export function bit(n?: number) {
  return makeDataType(variableLength(`bit`, n));
}
export function bitVarying(n?: number): ColumnDefinition<string>;
export function bitVarying<T>(n?: number): ColumnDefinition<T>;
export function bitVarying(n?: number) {
  return makeDataType(variableLength(`bit varying`, n));
}
export function varbit(n?: number): ColumnDefinition<string>;
export function varbit<T>(n?: number): ColumnDefinition<T>;
export function varbit(n?: number) {
  return makeDataType(variableLength(`varbit`, n));
}
export function boolean(): ColumnDefinition<boolean>;
export function boolean<T>(): ColumnDefinition<T>;
export function boolean() {
  return makeDataType(`boolean`);
}
export function bool(): ColumnDefinition<boolean>;
export function bool<T>(): ColumnDefinition<T>;
export function bool() {
  return makeDataType(`bool`);
}
export function box(): ColumnDefinition<string>;
export function box<T>(): ColumnDefinition<T>;
export function box() {
  return makeDataType(`box`);
}
export function bytea(): ColumnDefinition<Buffer>;
export function bytea<T>(): ColumnDefinition<T>;
export function bytea() {
  return makeDataType(`bytea`);
}

export function character(n?: number): ColumnDefinition<Text>;
export function character<T>(n?: number): ColumnDefinition<T>;
export function character(n?: number) {
  return makeDataType(variableLength(`character`, n));
}
export function char(n?: number): ColumnDefinition<Text>;
export function char<T>(n?: number): ColumnDefinition<T>;
export function char(n?: number) {
  return makeDataType(variableLength(`char`, n));
}
export function characterVarying(n?: number): ColumnDefinition<Text>;
export function characterVarying<T>(n?: number): ColumnDefinition<T>;
export function characterVarying(n?: number) {
  return makeDataType(variableLength(`character varying`, n));
}
export function varchar(n?: number): ColumnDefinition<Text>;
export function varchar<T>(n?: number): ColumnDefinition<T>;
export function varchar(n?: number) {
  return makeDataType(variableLength(`varchar`, n));
}

export function circle(): ColumnDefinition<{ x: number; y: number; radius: number }>;
export function circle<T>(): ColumnDefinition<T>;
export function circle() {
  return makeDataType(`circle`);
}

export function cidr(): ColumnDefinition<string>;
export function cidr<T>(): ColumnDefinition<T>;
export function cidr() {
  return makeDataType(`cidr`);
}
export function caseInsensitiveText(): ColumnDefinition<Text>;
export function caseInsensitiveText<T>(): ColumnDefinition<T>;
export function caseInsensitiveText() {
  return makeDataType(`citext`);
}
export function citext(): ColumnDefinition<Text>;
export function citext<T>(): ColumnDefinition<T>;
export function citext() {
  return makeDataType(`citext`);
}
export function date(): ColumnDefinition<Date>;
export function date<T>(): ColumnDefinition<T>;
export function date() {
  return makeDataType(`date`);
}

export function doublePrecision(): ColumnDefinition<Float8>;
export function doublePrecision<T>(): ColumnDefinition<T>;
export function doublePrecision() {
  return makeDataType(`double precision`);
}
export function float8(): ColumnDefinition<Float8>;
export function float8<T>(): ColumnDefinition<T>;
export function float8() {
  return makeDataType(`float8`);
}
export function inet(): ColumnDefinition<string>;
export function inet<T>(): ColumnDefinition<T>;
export function inet() {
  return makeDataType(`inet`);
}

export function decimal(): ColumnDefinition<Numeric>;
export function decimal(p: number): ColumnDefinition<Numeric>;
export function decimal(p: number, s: number): ColumnDefinition<Numeric>;
export function decimal<T>(): ColumnDefinition<T>;
export function decimal<T>(p: number): ColumnDefinition<T>;
export function decimal<T>(p: number, s: number): ColumnDefinition<T>;
export function decimal(...n: any[]) {
  return makeDataType(variableLength(`decimal`, ...n));
}
export function integer(): ColumnDefinition<Int4>;
export function integer<T>(): ColumnDefinition<T>;
export function integer() {
  return makeDataType(`integer`);
}

export function int(): ColumnDefinition<Int4>;
export function int<T>(): ColumnDefinition<T>;
export function int() {
  return makeDataType(`int`);
}
export function int4(): ColumnDefinition<Int4>;
export function int4<T>(): ColumnDefinition<T>;
export function int4() {
  return makeDataType(`int4`);
}
export function interval(): ColumnDefinition<unknown>;
export function interval<T>(): ColumnDefinition<T>;
export function interval() {
  return makeDataType(`interval`);
}
export function json(): ColumnDefinition<unknown>;
export function json<T>(): ColumnDefinition<T>;
export function json() {
  return makeDataType(`json`);
}
export function jsonb(): ColumnDefinition<unknown>;
export function jsonb<T>(): ColumnDefinition<T>;
export function jsonb() {
  return makeDataType(`jsonb`);
}
export function line(): ColumnDefinition<string>;
export function line<T>(): ColumnDefinition<T>;
export function line() {
  return makeDataType(`line`);
}
export function lseg(): ColumnDefinition<string>;
export function lseg<T>(): ColumnDefinition<T>;
export function lseg() {
  return makeDataType(`lseg`);
}
export function macaddr(): ColumnDefinition<string>;
export function macaddr<T>(): ColumnDefinition<T>;
export function macaddr() {
  return makeDataType(`macaddr`);
}
export function macaddr8(): ColumnDefinition<string>;
export function macaddr8<T>(): ColumnDefinition<T>;
export function macaddr8() {
  return makeDataType(`macaddr8`);
}
export function money(): ColumnDefinition<string>;
export function money<T>(): ColumnDefinition<T>;
export function money() {
  return makeDataType(`money`);
}

export function numeric(): ColumnDefinition<Numeric>;
export function numeric(p: number): ColumnDefinition<Numeric>;
export function numeric(p: number, s: number): ColumnDefinition<Numeric>;
export function numeric<T>(): ColumnDefinition<T>;
export function numeric<T>(p: number): ColumnDefinition<T>;
export function numeric<T>(p: number, s: number): ColumnDefinition<T>;
export function numeric(...n: any[]) {
  return makeDataType(variableLength(`numeric`, ...n));
}

export function point(): ColumnDefinition<{ x: number; y: number }>;
export function point<T>(): ColumnDefinition<T>;
export function point() {
  return makeDataType(`point`);
}

export function path(): ColumnDefinition<string>;
export function path<T>(): ColumnDefinition<T>;
export function path() {
  return makeDataType(`path`);
}
export function pgLsn(): ColumnDefinition<string>;
export function pgLsn<T>(): ColumnDefinition<T>;
export function pgLsn() {
  return makeDataType(`pg_lsn`);
}
export function polygon(): ColumnDefinition<string>;
export function polygon<T>(): ColumnDefinition<T>;
export function polygon() {
  return makeDataType(`polygon`);
}
export function real(): ColumnDefinition<Float4>;
export function real<T>(): ColumnDefinition<T>;
export function real() {
  return makeDataType(`real`);
}
export function float4(): ColumnDefinition<Float4>;
export function float4<T>(): ColumnDefinition<T>;
export function float4() {
  return makeDataType(`float4`);
}
export function smallint(): ColumnDefinition<Int4>;
export function smallint<T>(): ColumnDefinition<T>;
export function smallint() {
  return makeDataType(`smallint`);
}
export function int2(): ColumnDefinition<Int4>;
export function int2<T>(): ColumnDefinition<T>;
export function int2() {
  return makeDataType(`int2`);
}
export function text(): ColumnDefinition<Text>;
export function text<T>(): ColumnDefinition<T>;
export function text() {
  return makeDataType(`text`);
}
export function time(): ColumnDefinition<string>;
export function time<T>(): ColumnDefinition<T>;
export function time() {
  return makeDataType(`time`);
}
export function timeWithoutTimeZone(): ColumnDefinition<string>;
export function timeWithoutTimeZone<T>(): ColumnDefinition<T>;
export function timeWithoutTimeZone() {
  return makeDataType(`time without time zone`);
}
export function timeWithTimeZone(): ColumnDefinition<string>;
export function timeWithTimeZone<T>(): ColumnDefinition<T>;
export function timeWithTimeZone() {
  return makeDataType(`time with time zone`);
}
export function timestamp(): ColumnDefinition<Date>;
export function timestamp<T>(): ColumnDefinition<T>;
export function timestamp() {
  return makeDataType(`timestamp`);
}
export function timestamptz(): ColumnDefinition<Date>;
export function timestamptz<T>(): ColumnDefinition<T>;
export function timestamptz() {
  return makeDataType(`timestamptz`);
}
export function timestampWithoutTimeZone(): ColumnDefinition<Date>;
export function timestampWithoutTimeZone<T>(): ColumnDefinition<T>;
export function timestampWithoutTimeZone() {
  return makeDataType(`timestamp without time zone`);
}
export function timestampWithTimeZone(): ColumnDefinition<Date>;
export function timestampWithTimeZone<T>(): ColumnDefinition<T>;
export function timestampWithTimeZone() {
  return makeDataType(`timestamp with time zone`);
}
export function tsquery(): ColumnDefinition<string>;
export function tsquery<T>(): ColumnDefinition<T>;
export function tsquery() {
  return makeDataType(`tsquery`);
}
export function tsvector(): ColumnDefinition<string>;
export function tsvector<T>(): ColumnDefinition<T>;
export function tsvector() {
  return makeDataType(`tsvector`);
}
export function txidSnapshot(): ColumnDefinition<string>;
export function txidSnapshot<T>(): ColumnDefinition<T>;
export function txidSnapshot() {
  return makeDataType(`txid_snapshot`);
}
export function uuid(): ColumnDefinition<Uuid<unknown>>;
export function uuid<T>(): ColumnDefinition<T>;
export function uuid() {
  return makeDataType(`uuid`);
}
export function xml(): ColumnDefinition<string>;
export function xml<T>(): ColumnDefinition<T>;
export function xml() {
  return makeDataType(`xml`);
}

// enum is a reserved keyword unfortunately
export function enumType<EnumValue>(
  name: string,
  values: readonly EnumValue[],
): ColumnDefinition<EnumValue> {
  return makeDataType<EnumValue>(name, values as any);
}

export function array<T>(dataType: ColumnDefinition<T>) {
  return internalArray<T[]>(dataType, 1);
}

export function array2d<T>(dataType: ColumnDefinition<T>) {
  return internalArray<T[][]>(dataType, 2);
}

function internalArray<T>(dataType: ColumnDefinition<T>, dimensions: number) {
  const definition = dataType.getDefinition();
  return makeDataType<T>(definition.dataType + '[]'.repeat(dimensions));
}
