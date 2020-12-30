import { Column, ColumnDefinition, makeColumnDefinition } from './column';

const variableLength = (string: string, ...n: (number | undefined)[]) =>
  n.length > 0 ? `${string}(${n.join(`, `)})` : string;

const makeDataType = makeColumnDefinition;

export function dataType<T>(dataType: string) {
  return makeDataType<T>(dataType);
}

export function int8(): ColumnDefinition<string>;
export function int8<T>(): ColumnDefinition<T>;
export function int8() {
  return makeDataType(`int8`);
}
export function bigint(): ColumnDefinition<string>;
export function bigint<T>(): ColumnDefinition<T>;
export function bigint() {
  return makeDataType(`bigint`);
}
export function bigserial(): ColumnDefinition<string, false, true>;
export function bigserial<T>(): ColumnDefinition<T, false, true>;
export function bigserial() {
  return makeDataType(`bigserial`);
}
export function serial8(): ColumnDefinition<string, false, true>;
export function serial8<T>(): ColumnDefinition<T, false, true>;
export function serial8() {
  return makeDataType(`serial8`);
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

export function character(n?: number): ColumnDefinition<string>;
export function character<T>(n?: number): ColumnDefinition<T>;
export function character(n?: number) {
  return makeDataType(variableLength(`character`, n));
}
export function char(n?: number): ColumnDefinition<string>;
export function char<T>(n?: number): ColumnDefinition<T>;
export function char(n?: number) {
  return makeDataType(variableLength(`char`, n));
}
export function characterVarying(n?: number): ColumnDefinition<string>;
export function characterVarying<T>(n?: number): ColumnDefinition<T>;
export function characterVarying(n?: number) {
  return makeDataType(variableLength(`character varying`, n));
}
export function varchar(n?: number): ColumnDefinition<string>;
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
export function caseInsensitiveText(): ColumnDefinition<string>;
export function caseInsensitiveText<T>(): ColumnDefinition<T>;
export function caseInsensitiveText() {
  return makeDataType(`citext`);
}
export function citext(): ColumnDefinition<string>;
export function citext<T>(): ColumnDefinition<T>;
export function citext() {
  return makeDataType(`citext`);
}
export function date(): ColumnDefinition<Date>;
export function date<T>(): ColumnDefinition<T>;
export function date() {
  return makeDataType(`date`);
}

export function doublePrecision(): ColumnDefinition<number>;
export function doublePrecision<T>(): ColumnDefinition<T>;
export function doublePrecision() {
  return makeDataType(`double precision`);
}
export function float8(): ColumnDefinition<number>;
export function float8<T>(): ColumnDefinition<T>;
export function float8() {
  return makeDataType(`float8`);
}
export function inet(): ColumnDefinition<string>;
export function inet<T>(): ColumnDefinition<T>;
export function inet() {
  return makeDataType(`inet`);
}

export function decimal(): ColumnDefinition<string>;
export function decimal(p: number): ColumnDefinition<string>;
export function decimal(p: number, s: number): ColumnDefinition<string>;
export function decimal<T>(): ColumnDefinition<T>;
export function decimal<T>(p: number): ColumnDefinition<T>;
export function decimal<T>(p: number, s: number): ColumnDefinition<T>;
export function decimal(...n: any[]) {
  return makeDataType(variableLength(`decimal`, ...n));
}
export function integer(): ColumnDefinition<number>;
export function integer<T>(): ColumnDefinition<T>;
export function integer() {
  return makeDataType(`integer`);
}

export function int(): ColumnDefinition<number>;
export function int<T>(): ColumnDefinition<T>;
export function int() {
  return makeDataType(`int`);
}
export function int4(): ColumnDefinition<number>;
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

export function numeric(): ColumnDefinition<string>;
export function numeric(p: number): ColumnDefinition<string>;
export function numeric(p: number, s: number): ColumnDefinition<string>;
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
export function real(): ColumnDefinition<number>;
export function real<T>(): ColumnDefinition<T>;
export function real() {
  return makeDataType(`real`);
}
export function float4(): ColumnDefinition<number>;
export function float4<T>(): ColumnDefinition<T>;
export function float4() {
  return makeDataType(`float4`);
}
export function smallint(): ColumnDefinition<number>;
export function smallint<T>(): ColumnDefinition<T>;
export function smallint() {
  return makeDataType(`smallint`);
}
export function int2(): ColumnDefinition<number>;
export function int2<T>(): ColumnDefinition<T>;
export function int2() {
  return makeDataType(`int2`);
}
export function serial(): ColumnDefinition<number, false, true>;
export function serial<T>(): ColumnDefinition<T, false, true>;
export function serial() {
  return makeDataType(`serial`);
}
export function serial4(): ColumnDefinition<number, false, true>;
export function serial4<T>(): ColumnDefinition<T, false, true>;
export function serial4() {
  return makeDataType(`serial4`);
}
export function smallserial(): ColumnDefinition<number, false, true>;
export function smallserial<T>(): ColumnDefinition<T, false, true>;
export function smallserial() {
  return makeDataType(`smallserial`);
}
export function serial2(): ColumnDefinition<number, false, true>;
export function serial2<T>(): ColumnDefinition<T, false, true>;
export function serial2() {
  return makeDataType(`serial2`);
}
export function text(): ColumnDefinition<string>;
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
export function uuid(): ColumnDefinition<string>;
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
