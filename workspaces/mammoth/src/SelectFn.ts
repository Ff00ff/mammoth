import {
  AnyExpression,
  BooleanExpression,
  Expression,
  NumberExpression,
  RawExpression,
  SharedExpression,
  TextExpression,
} from './expression';
import { AnyColumn, Column, ColumnSet } from './column';

import { SelectQuery } from './select';
import { Star } from './sql-functions';
import { DbConfig } from './config';

export type GetSelectableName<S> = S extends Column<
  any,
  infer Name,
  string,
  any,
  boolean,
  boolean,
  any
>
  ? Name
  : S extends NumberExpression<any, any, boolean, infer Name>
  ? Name
  : S extends TextExpression<any, any, boolean, infer Name>
  ? Name
  : S extends BooleanExpression<any, any, boolean, infer Name>
  ? Name
  : S extends RawExpression<any, any, boolean, infer Name>
  ? Name
  : S extends Expression<any, any, boolean, infer Name>
  ? Name
  : S extends SelectQuery<any, infer Columns>
  ? keyof Columns // This only works if the query has one select clause
  : never;

export type GetSelectable<C extends Selectable> = C extends ColumnSet<infer Columns>
  ? Columns
  : GetSelectableName<C> extends string
  ? { [K in GetSelectableName<C>]: C }
  : never;

export type Selectable =
  | AnyExpression
  | SelectQuery<any, any, boolean>
  | AnyColumn
  | ColumnSet<any>
  | Star;

type ContainsStar<Selectables> = Extract<Star, Selectables> extends never ? false : true;

type GetSelectables<Columns extends Array<any>> = {
  [I in keyof Columns]: Columns[I] extends Selectable ? GetSelectable<Columns[I]> : never;
};

// Taken from https://stackoverflow.com/a/51604379/163832
type BoxedTupleTypes<T extends any[]> = { [P in keyof T]: [T[P]] }[Exclude<keyof T, keyof any[]>];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type UnboxIntersection<T> = T extends { 0: infer U } ? U : never;
type TupleToIntersection<T extends Array<any>> = UnboxIntersection<
  UnionToIntersection<BoxedTupleTypes<T>>
>;
type ToColumns<T> = T extends { [column: string]: any } ? T : never;

export interface SelectFn<Config extends DbConfig> {
  <Columns extends Selectable[]>(...columns: [...Columns]): SelectQuery<
    Config,
    ToColumns<TupleToIntersection<GetSelectables<Columns>>>,
    ContainsStar<Columns[number]>
  >;
}
