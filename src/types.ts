import { ColumnWrapper } from './columns';
import { PickByValue } from 'utility-types';

// These types are used to switch between optional and required properties. Because these are
// specific types it's possible to use TypeScript's condition types feature to map nullable columns
// to optional keys.
export interface Null<T> {
  nullType: T;
}

export interface NotNull<T> {
  notNullType: T;
}

export type toNotNull<T> = T extends Null<any>
  ? NotNull<T['nullType']>
  : T extends NotNull<ay>
  ? T
  : NotNull<T>;
export type toNull<T> = T extends NotNull<any>
  ? Null<T['notNullType']>
  : T extends Null<any>
  ? T
  : Null<T>;
export type toType<T> = T extends never
  ? never
  : T extends NotNull<any>
  ? T['notNullType']
  : T extends Null<any>
  ? T['nullType'] | undefined | null
  : T;

export type toTypeWithNull<T> = T extends NotNull<any>
  ? T['notNullType']
  : T extends Null<any>
  ? null | undefined
  : T;

export type TypeOf<T> = {
  [K in keyof T]?: toType<T[K]>;
};

export type TypeOfNotNullable<T> = {
  [K in keyof T]: toType<T[K]>;
};

export type Nullable<T> = {
  // To make sure explicitly passing null is allowed as well
  [P in keyof T]?: T[P] | null | undefined;
};

export type SplitOptionalAndRequired<
  Table extends { [columnName: string]: ColumnWrapper<any, any, any, any, any> },
  ColumnType extends 'insertType' | 'selectType' | 'updateType'
> = Nullable<TypeOf<PickByValue<{ [K in keyof Table]: Table[K][ColumnType] }, Null<any>>>> &
  TypeOfNotNullable<PickByValue<{ [K in keyof Table]: Table[K][ColumnType] }, NotNull<any>>>;
