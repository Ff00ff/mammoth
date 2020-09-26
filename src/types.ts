import { Column } from './column';
import { DeleteQuery } from './delete';
import { InsertQuery } from './insert';
import { NamedExpression } from './expression';
import { SelectQuery } from './select';
import { UpdateQuery } from './update';

export type ResultType = 'ROWS' | 'AFFECTED_COUNT';

export type PickByValue<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
  }[keyof T]
>;

export type Query =
  | SelectQuery<any>
  | UpdateQuery<any, any>
  | InsertQuery<any, any>
  | DeleteQuery<any, any>;

type GetColumnDataType<C> = C extends Column<any, any, infer DataType, infer IsNotNull, any, any>
  ? IsNotNull extends true
    ? DataType
    : DataType | undefined
  : never;

export type GetReturning<TableColumns, ColumnName extends keyof TableColumns> = {
  [K in ColumnName]: GetColumnDataType<TableColumns[K]>;
};

class DataType<Type, IsNull> {
  private _!: Type & IsNull;
}

export type ResultSet<T extends Query> = T extends SelectQuery<infer Selectables>
  ? {
      [K in keyof Selectables]: Selectables[K] extends Column<
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
                ? DataType<D, true>
                : DataType<D, false>
              : DataType<D, false>
            : DataType<D, false>
          : DataType<D, false>
        : Selectables[K] extends NamedExpression<any, infer D, infer IsNotNull>
        ? DataType<D, IsNotNull>
        : Selectables[K] extends SelectQuery<{}>
        ? ResultSet<Selectables[K]>[keyof ResultSet<Selectables[K]>]
        : never;
    }
  : T extends UpdateQuery<any, infer C>
  ? C
  : T extends InsertQuery<any, infer C>
  ? C
  : T extends DeleteQuery<any, infer C>
  ? C
  : never;
