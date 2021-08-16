import { DbConfig, GetResultType } from './config';
import { Err, GetDataType } from './types';

import type { Column } from './column';
import { DeleteQuery } from './delete';
import type { Expression } from './expression';
import { InsertQuery } from './insert';
import { Query } from './query';
import { SelectQuery } from './select';
import { UpdateQuery } from './update';

export type ResultSetDataType<Config extends DbConfig, Type, IsNotNull> = IsNotNull extends true
  ? GetResultType<Config, Type>
  : GetResultType<Config, Type> | GetResultType<Config, 'Null'>;

type ReturningResultSet<Config extends DbConfig, Returning, Test extends boolean> = {
  [K in keyof Returning]: Returning[K] extends Column<
    any,
    any,
    any,
    infer D,
    infer N,
    any,
    infer JoinType
  >
    ? Extract<JoinType, 'left-join'> extends never
      ? Extract<JoinType, 'left-side-of-right-join'> extends never
        ? Extract<JoinType, 'full-join'> extends never
          ? N extends true
            ? Test extends true
              ? GetDataType<D, true>
              : ResultSetDataType<Config, D, true>
            : Test extends true
            ? GetDataType<D, false>
            : ResultSetDataType<Config, D, false>
          : Test extends true
          ? GetDataType<D, false>
          : ResultSetDataType<Config, D, false>
        : Test extends true
        ? GetDataType<D, false>
        : ResultSetDataType<Config, D, false>
      : Test extends true
      ? GetDataType<D, false>
      : ResultSetDataType<Config, D, false>
    : Returning[K] extends Expression<any, infer D, infer IsNotNull, any>
    ? Test extends true
      ? GetDataType<D, IsNotNull>
      : ResultSetDataType<Config, D, IsNotNull>
    : Returning[K] extends Query<{}>
    ? ResultSet<Config, Returning[K], Test>[keyof ResultSet<Config, Returning[K], Test>]
    : never;
};

// This is not ideal, but, using dts-jest and it's snapshotting it's not capable to snapshot an e.g.
// optional number to `number | undefined`. Instead, it will snapshot to `number`. Because it's
// important to get the optional behaviour under test as well (it's so easy to create a regression)
// this flag is introduced to return a nominal class which gets snapshotted with the correct info.
export type ResultSet<Config extends DbConfig, T, Test extends boolean> = T extends SelectQuery<
  Config,
  infer Returning
>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
        any,
        any,
        any,
        infer D,
        infer N,
        any,
        infer JoinType
      >
        ? Extract<JoinType, 'left-join'> extends never
          ? Extract<JoinType, 'left-side-of-right-join'> extends never
            ? Extract<JoinType, 'full-join'> extends never
              ? N extends true
                ? Test extends true
                  ? GetDataType<D, true>
                  : ResultSetDataType<Config, D, true>
                : Test extends true
                ? GetDataType<D, false>
                : ResultSetDataType<Config, D, false>
              : Test extends true
              ? GetDataType<D, false>
              : ResultSetDataType<Config, D, false>
            : Test extends true
            ? GetDataType<D, false>
            : ResultSetDataType<Config, D, false>
          : Test extends true
          ? GetDataType<D, false>
          : ResultSetDataType<Config, D, false>
        : // To avoid an issue where I (IsNotNull) would become boolean instead of true or false, we
        // extend Expression<..> twice with separate infers.
        Returning[K] extends Expression<any, any, infer I, string>
        ? Returning[K] extends Expression<any, infer D, I, string>
          ? Test extends true
            ? GetDataType<D, I>
            : ResultSetDataType<Config, D, I>
          : Err<'not an expression'>
        : Returning[K] extends Query<{}>
        ? ResultSet<Config, Returning[K], Test>[keyof ResultSet<Config, Returning[K], Test>]
        : never;
    }
  : T extends DeleteQuery<Config, any, infer Returning>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
        Config,
        any,
        any,
        infer D,
        infer N,
        any,
        infer JoinType
      >
        ? Extract<JoinType, 'left-join'> extends never
          ? Extract<JoinType, 'left-side-of-right-join'> extends never
            ? Extract<JoinType, 'full-join'> extends never
              ? N extends true
                ? Test extends true
                  ? GetDataType<D, true>
                  : ResultSetDataType<Config, D, true>
                : Test extends true
                ? GetDataType<D, false>
                : ResultSetDataType<Config, D, false>
              : Test extends true
              ? GetDataType<D, false>
              : ResultSetDataType<Config, D, false>
            : Test extends true
            ? GetDataType<D, false>
            : ResultSetDataType<Config, D, false>
          : Test extends true
          ? GetDataType<D, false>
          : ResultSetDataType<Config, D, false>
        : Returning[K] extends Expression<any, infer D, infer IsNotNull, any>
        ? Test extends true
          ? GetDataType<D, IsNotNull>
          : ResultSetDataType<Config, D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Config, Returning[K], Test>[keyof ResultSet<Config, Returning[K], Test>]
        : never;
    }
  : T extends UpdateQuery<Config, any, infer Returning>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
        Config,
        any,
        any,
        infer D,
        infer N,
        any,
        infer JoinType
      >
        ? Extract<JoinType, 'left-join'> extends never
          ? Extract<JoinType, 'left-side-of-right-join'> extends never
            ? Extract<JoinType, 'full-join'> extends never
              ? N extends true
                ? Test extends true
                  ? GetDataType<D, true>
                  : ResultSetDataType<Config, D, true>
                : Test extends true
                ? GetDataType<D, false>
                : ResultSetDataType<Config, D, false>
              : Test extends true
              ? GetDataType<D, false>
              : ResultSetDataType<Config, D, false>
            : Test extends true
            ? GetDataType<D, false>
            : ResultSetDataType<Config, D, false>
          : Test extends true
          ? GetDataType<D, false>
          : ResultSetDataType<Config, D, false>
        : Returning[K] extends Expression<any, infer D, infer IsNotNull, any>
        ? Test extends true
          ? GetDataType<D, IsNotNull>
          : ResultSetDataType<Config, D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Config, Returning[K], Test>[keyof ResultSet<Config, Returning[K], Test>]
        : never;
    }
  : T extends InsertQuery<Config, any, infer Returning>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
        any,
        any,
        any,
        infer D,
        infer N,
        any,
        infer JoinType
      >
        ? Extract<JoinType, 'left-join'> extends never
          ? Extract<JoinType, 'left-side-of-right-join'> extends never
            ? Extract<JoinType, 'full-join'> extends never
              ? N extends true
                ? Test extends true
                  ? GetDataType<D, true>
                  : ResultSetDataType<Config, D, true>
                : Test extends true
                ? GetDataType<D, false>
                : ResultSetDataType<Config, D, false>
              : Test extends true
              ? GetDataType<D, false>
              : ResultSetDataType<Config, D, false>
            : Test extends true
            ? GetDataType<D, false>
            : ResultSetDataType<Config, D, false>
          : Test extends true
          ? GetDataType<D, false>
          : ResultSetDataType<Config, D, false>
        : Returning[K] extends Expression<any, infer D, infer IsNotNull, any>
        ? Test extends true
          ? GetDataType<D, IsNotNull>
          : ResultSetDataType<Config, D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Config, Returning[K], Test>[keyof ResultSet<Config, Returning[K], Test>]
        : never;
    }
  : Err<'not a query'>;
