// import type { Column } from './column';
import type { DeleteQuery } from './delete';
import type { InsertQuery } from './insert';
// import type { NamedExpression } from './expression';
import type { SelectQuery } from './select';
import type { UpdateQuery } from './update';
// import { Table } from './table';

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

export type GetReturning<TableColumns, ColumnName extends keyof TableColumns> = {
  [K in ColumnName]: TableColumns[K];
};

export class GetDataType<Type, IsNull> {
  private _!: Type & IsNull;
}

export type ResultSetDataType<Type, IsNotNull> = IsNotNull extends true
  ? Type
  : Type | undefined; 

export type ResultSet<T extends Query, Test extends boolean> = T extends SelectQuery<infer Selectables>
  ? unknown
  : T extends UpdateQuery<any, infer Returning>
  ? { update: true }
  : T extends InsertQuery<any, infer Returning>
  ? { insert: true }
  : T extends DeleteQuery<any, infer Returning>
  ? { isDeleteQuery: true }
  : { test: true };

export type ResultSet2<T extends Query, Test extends boolean> = T extends SelectQuery<infer Selectables>
  ? {
      // [K in keyof Selectables]: Selectables[K] extends Column<
      //   any,
      //   any,
      //   infer D,
      //   infer N,
      //   any,
      //   infer JoinType
      // >
      //   ? Extract<JoinType, 'left-join'> extends never
      //     ? Extract<JoinType, 'left-side-of-right-join'> extends never
      //       ? Extract<JoinType, 'full-join'> extends never
      //         ? N extends true
      //           ? Test extends true ? GetDataType<D, true> : ResultSetDataType<D, true>
      //           : Test extends true ? GetDataType<D, false> : ResultSetDataType<D, false>
      //         : Test extends true ? GetDataType<D, false> : ResultSetDataType<D, false>
      //       : Test extends true ? GetDataType<D, false> : ResultSetDataType<D, false>
      //     : Test extends true ? GetDataType<D, false> : ResultSetDataType<D, false>
      //   : Selectables[K] extends NamedExpression<any, infer D, infer IsNotNull>
      //   ? Test extends true ? GetDataType<D, IsNotNull> : ResultSetDataType<D, IsNotNull>
      //   : Selectables[K] extends SelectQuery<{}>
      //   ? ResultSet<Selectables[K], Test>[keyof ResultSet<Selectables[K], Test>]
      //   : never;
      test: true;
    }
  // : T extends UpdateQuery<any, infer C>
  // ? C
  // : T extends InsertQuery<any, infer C>
  // ? C
  : T extends DeleteQuery<any, infer Returning>
  ? {
        test: true;
        // [K in keyof Returning]: Returning[K] extends Column<any, any, infer DataType, infer IsNotNull, any, any>
        //   ? Test extends true ? GetDataType<DataType, IsNotNull> : ResultSetDataType<DataType, IsNotNull>
        //   : Returning[K] extends NamedExpression<any, infer DataType, infer IsNotNull>
        //   ? Test extends true ? GetDataType<DataType, IsNotNull> : ResultSetDataType<DataType, IsNotNull>
        //   : Returning[K] extends Query
        //   ? ResultSet<Returning[K], Test>[keyof ResultSet<Returning[K], Test>]
        //   : never
    }
  : never;
