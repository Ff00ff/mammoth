import { Column } from './column';
import { DbConfig } from './config';

export type AnyTable = Table<any, any, any>;

export type Table<Config extends DbConfig, TableName, Columns> = Columns &
  InternalTable<Config, TableName, Columns>;

export interface InternalTable<Config extends DbConfig, TableName, Columns> {
  /** @internal */
  _tableBrand: any;

  /** @internal */
  getName(): string;

  /** @internal */
  getOriginalName(): string;

  // Because we use the column's table name to determine whether the data type should be nullable
  // when joining, we change the column's table name to the alias.
  as<T>(alias: T): Table<
    Config,
    T,
    {
      [K in keyof Columns]: Columns[K] extends Column<
        Config,
        infer Name,
        string,
        infer DataType,
        infer IsNotNull,
        infer HasDefault,
        infer JoinType
      >
        ? Column<Config, Name, T, DataType, IsNotNull, HasDefault, JoinType>
        : never;
    }
  >;
}
