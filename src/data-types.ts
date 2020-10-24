import { Column, ColumnDefinition, makeColumnDefinition } from './column';

const variableLength = (string: string, ...n: (number | undefined)[]) =>
  n.length > 0 ? `${string}(${n.join(`, `)})` : string;

const makeDataType = makeColumnDefinition;

export function dataType<T>(dataType: string) {
  return makeDataType<T>(dataType);
}

export function int8(): ColumnDefinition<number>;
export function int8<T>() {
  return makeDataType<T>(`int8`);
}
export function bigint(): ColumnDefinition<number>;
export function bigint<T>() {
  return makeDataType<T>(`bigint`);
}
export function bigserial(): ColumnDefinition<number>;
export function bigserial<T>() {
  return makeDataType<T>(`bigserial`);
}
export function serial8(): ColumnDefinition<number>;
export function serial8<T>() {
  return makeDataType<T>(`serial8`);
}

export function bit(n?: number): ColumnDefinition<string>;
export function bit<T>(n?: number) {
  return makeDataType<T>(variableLength(`bit`, n));
}
export function bitVarying(n?: number): ColumnDefinition<string>;
export function bitVarying<T>(n?: number) {
  return makeDataType<T>(variableLength(`bit varying`, n));
}
export function varbit(n?: number): ColumnDefinition<string>;
export function varbit<T>(n?: number) {
  return makeDataType<T>(variableLength(`varbit`, n));
}
export function boolean(): ColumnDefinition<boolean>;
export function boolean<T>() {
  return makeDataType<T>(`boolean`);
}
export function bool(): ColumnDefinition<boolean>;
export function bool<T>() {
  return makeDataType<T>(`bool`);
}
export function box(): ColumnDefinition<string>;
export function box<T>() {
  return makeDataType<T>(`box`);
}
export function bytea(): ColumnDefinition<Buffer>;
export function bytea<T>() {
  return makeDataType<T>(`bytea`);
}

export function character(n?: number): ColumnDefinition<string>;
export function character<T>(n?: number) {
  return makeDataType<T>(variableLength(`character`, n));
}
export function char(n?: number): ColumnDefinition<string>;
export function char<T>(n?: number) {
  return makeDataType<T>(variableLength(`char`, n));
}
export function characterVarying(n?: number): ColumnDefinition<string>;
export function characterVarying<T>(n?: number) {
  return makeDataType<T>(variableLength(`character varying`, n));
}
export function varchar(n?: number): ColumnDefinition<string>;
export function varchar<T>(n?: number) {
  return makeDataType<T>(variableLength(`varchar`, n));
}

export function circle(): ColumnDefinition<{ x: number; y: number; radius: number }>;
export function circle<T>() {
  return makeDataType<T>(`circle`);
}

export function cidr(): ColumnDefinition<string>;
export function cidr<T>() {
  return makeDataType<T>(`cidr`);
}
export function caseInsensitiveText(): ColumnDefinition<string>;
export function caseInsensitiveText<T>() {
  return makeDataType<T>(`citext`);
}
export function citext(): ColumnDefinition<string>;
export function citext<T>() {
  return makeDataType<T>(`citext`);
}
export function date(): ColumnDefinition<Date>;
export function date<T>() {
  return makeDataType<T>(`date`);
}
export function doublePrecision(): ColumnDefinition<number>;
export function doublePrecision<T>() {
  return makeDataType<T>(`double precision`);
}
export function float8(): ColumnDefinition<number>;
export function float8<T>() {
  return makeDataType<T>(`float8`);
}
export function inet(): ColumnDefinition<string>;
export function inet<T>() {
  return makeDataType<T>(`inet`);
}

export function decimal<T = string>(): ColumnDefinition<T>;
export function decimal<T = string>(p: number): ColumnDefinition<T>;
export function decimal<T = string>(p: number, s: number): ColumnDefinition<T>;
export function decimal<T = string>(...n: any[]): ColumnDefinition<T> {
  return makeDataType<T>(variableLength(`decimal`, ...n));
}
export function integer(): ColumnDefinition<number>;
export function integer<T>() {
  return makeDataType<T>(`integer`);
}

export function int(): ColumnDefinition<number>;
export function int<T>() {
  return makeDataType<T>(`int`);
}
export function int4(): ColumnDefinition<number>;
export function int4<T>() {
  return makeDataType<T>(`int4`);
}
export function interval(): ColumnDefinition<unknown>;
export function interval<T>() {
  return makeDataType<T>(`interval`);
}
export function json(): ColumnDefinition<unknown>;
export function json<T>() {
  return makeDataType<T>(`json`);
}
export function jsonb(): ColumnDefinition<unknown>;
export function jsonb<T>() {
  return makeDataType<T>(`jsonb`);
}
export function line(): ColumnDefinition<string>;
export function line<T>() {
  return makeDataType<T>(`line`);
}
export function lseg(): ColumnDefinition<string>;
export function lseg<T>() {
  return makeDataType<T>(`lseg`);
}
export function macaddr(): ColumnDefinition<string>;
export function macaddr<T>() {
  return makeDataType<T>(`macaddr`);
}
export function macaddr8(): ColumnDefinition<string>;
export function macaddr8<T>() {
  return makeDataType<T>(`macaddr8`);
}
export function money(): ColumnDefinition<string>;
export function money<T>() {
  return makeDataType<T>(`money`);
}

export function numeric<T = string>(): ColumnDefinition<T>;
export function numeric<T = string>(p: number): ColumnDefinition<T>;
export function numeric<T = string>(p: number, s: number): ColumnDefinition<T>;
export function numeric<T = string>(...n: any[]): ColumnDefinition<T> {
  return makeDataType<T>(variableLength(`numeric`, ...n));
}

export function point(): ColumnDefinition<{ x: number; y: number }>;
export function point<T>() {
  return makeDataType<T>(`point`);
}

export function path(): ColumnDefinition<string>;
export function path<T>() {
  return makeDataType<T>(`path`);
}
export function pgLsn(): ColumnDefinition<string>;
export function pgLsn<T>() {
  return makeDataType<T>(`pg_lsn`);
}
export function polygon(): ColumnDefinition<string>;
export function polygon<T>() {
  return makeDataType<T>(`polygon`);
}
export function real(): ColumnDefinition<number>;
export function real<T>() {
  return makeDataType<T>(`real`);
}
export function float4(): ColumnDefinition<number>;
export function float4<T>() {
  return makeDataType<T>(`float4`);
}
export function smallint(): ColumnDefinition<number>;
export function smallint<T>() {
  return makeDataType<T>(`smallint`);
}
export function int2(): ColumnDefinition<number>;
export function int2<T>() {
  return makeDataType<T>(`int2`);
}
export function serial(): ColumnDefinition<number>;
export function serial<T>() {
  return makeDataType<T>(`serial`);
}
export function serial4(): ColumnDefinition<number>;
export function serial4<T>() {
  return makeDataType<T>(`serial4`);
}
export function smallserial(): ColumnDefinition<number>;
export function smallserial<T>() {
  return makeDataType<T>(`smallserial`);
}
export function serial2(): ColumnDefinition<number>;
export function serial2<T>() {
  return makeDataType<T>(`serial2`);
}
export function text(): ColumnDefinition<string>;
export function text<T>() {
  return makeDataType<T>(`text`);
}
export function time(): ColumnDefinition<string>;
export function time<T>() {
  return makeDataType<T>(`time`);
}
export function timeWithoutTimeZone(): ColumnDefinition<string>;
export function timeWithoutTimeZone<T>() {
  return makeDataType<T>(`time without time zone`);
}
export function timeWithTimeZone(): ColumnDefinition<string>;
export function timeWithTimeZone<T>() {
  return makeDataType<T>(`time with time zone`);
}
export function timestamp(): ColumnDefinition<Date>;
export function timestamp<T>() {
  return makeDataType<T>(`timestamp`);
}
export function timestamptz(): ColumnDefinition<Date>;
export function timestamptz<T>() {
  return makeDataType<T>(`timestamptz`);
}
export function timestampWithoutTimeZone(): ColumnDefinition<Date>;
export function timestampWithoutTimeZone<T>() {
  return makeDataType<T>(`timestamp without time zone`);
}
export function timestampWithTimeZone(): ColumnDefinition<Date>;
export function timestampWithTimeZone<T>() {
  return makeDataType<T>(`timestamp with time zone`);
}
export function tsquery(): ColumnDefinition<string>;
export function tsquery<T>() {
  return makeDataType<T>(`tsquery`);
}
export function tsvector(): ColumnDefinition<string>;
export function tsvector<T>() {
  return makeDataType<T>(`tsvector`);
}
export function txidSnapshot(): ColumnDefinition<string>;
export function txidSnapshot<T>() {
  return makeDataType<T>(`txid_snapshot`);
}
export function uuid(): ColumnDefinition<string>;
export function uuid<T>() {
  return makeDataType<T>(`uuid`);
}
export function xml(): ColumnDefinition<string>;
export function xml<T>() {
  return makeDataType<T>(`xml`);
}
