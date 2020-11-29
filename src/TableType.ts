import { Column } from './column';

export type Table<TableName, Columns> = Columns & InternalTable<TableName, Columns>;

export interface InternalTable<TableName, Columns> {
  /** @internal */
  _tableBrand: any;

  /** @internal */
  getName(): string;

  /** @internal */
  getOriginalName(): string;

  // Because we use the column's table name to determine whether the data type should be nullable
  // when joining, we change the column's table name to the alias.
  as<T>(
    alias: T,
  ): Table<
    T,
    {
      [K in keyof Columns]: Columns[K] extends Column<
        infer Name,
        string,
        infer DataType,
        infer IsNotNull,
        infer HasDefault,
        infer JoinType
      >
        ? Column<Name, T, DataType, IsNotNull, HasDefault, JoinType>
        : never;
    }
  >;
}
