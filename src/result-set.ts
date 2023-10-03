import type { Column } from './column';
import { DeleteQuery } from './delete';
import type { Expression } from './expression';
import { InsertQuery } from './insert';
import { Query } from './query';
import { SelectQuery } from './select';
import { UpdateQuery } from './update';

export type ResultSetDataType<Type, IsNotNull extends boolean> = IsNotNull extends true ? Type : Type | null;

// This is not ideal, but, using dts-jest and it's snapshotting it's not capable to snapshot an e.g.
// optional number to `number | undefined`. Instead, it will snapshot to `number`. Because it's
// important to get the optional behaviour under test as well (it's so easy to create a regression)
// this flag is introduced to return a nominal class which gets snapshotted with the correct info.
export type ResultSet<T extends Query<any>> = T extends SelectQuery<
  infer Returning
>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
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
                ? ResultSetDataType<D, true>
                : ResultSetDataType<D, false>
              : ResultSetDataType<D, false>
            : ResultSetDataType<D, false>
          : ResultSetDataType<D, false>
        : Returning[K] extends Expression<infer D, infer IsNotNull, any>
        ? ResultSetDataType<D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Returning[K]>[keyof ResultSet<Returning[K]>]
        : never;
    }
  : T extends DeleteQuery<any, infer Returning>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
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
                ? ResultSetDataType<D, true>
                : ResultSetDataType<D, false>
              : ResultSetDataType<D, false>
            : ResultSetDataType<D, false>
          : ResultSetDataType<D, false>
        : Returning[K] extends Expression<infer D, infer IsNotNull, any>
        ? ResultSetDataType<D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Returning[K]>[keyof ResultSet<Returning[K]>]
        : never;
    }
  : T extends UpdateQuery<any, infer Returning>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
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
                ? ResultSetDataType<D, true>
                : ResultSetDataType<D, false>
              : ResultSetDataType<D, false>
            : ResultSetDataType<D, false>
          : ResultSetDataType<D, false>
        : Returning[K] extends Expression<infer D, infer IsNotNull, any>
        ? ResultSetDataType<D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Returning[K]>[keyof ResultSet<Returning[K]>]
        : never;
    }
  : T extends InsertQuery<any, infer Returning>
  ? {
      [K in keyof Returning]: Returning[K] extends Column<
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
                ? ResultSetDataType<D, true>
                : ResultSetDataType<D, false>
              : ResultSetDataType<D, false>
            : ResultSetDataType<D, false>
          : ResultSetDataType<D, false>
        : Returning[K] extends Expression<infer D, infer IsNotNull, any>
        ? ResultSetDataType<D, IsNotNull>
        : Returning[K] extends Query<{}>
        ? ResultSet<Returning[K]>[keyof ResultSet<Returning[K]>]
        : never;
    }
  : never;
