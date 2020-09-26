import { InternalExpression, makeExpression } from './expression';
import { StringToken, Token } from './tokens';

import { Table } from './table';
import { toSnakeCase } from './naming/snake-case';

export interface ColumnDefinition<DataType, IsNotNull extends boolean, HasDefault extends boolean> {
  notNull(): ColumnDefinition<DataType, true, HasDefault>;
  primaryKey(): ColumnDefinition<DataType, true, HasDefault>;
  // In most cases a default clause means you do not need to provide any value during insert. In
  // theory however it's possible the default expression doesn't set a value in some case. In the
  // case of a NOT NULL constraint this would mean you'd have to set a value when inserting. Because
  // this is not neccesary in most of the cases we just assume a default expression will always set
  // a value. You can opt out of this by setting `IsAlwaysSettingAValue` to false.
  default<IsAlwaysSettingAValue extends boolean = true>(
    defaultExpression: string
  ): ColumnDefinition<DataType, IsNotNull, IsAlwaysSettingAValue>;
  check(): ColumnDefinition<DataType, IsNotNull, HasDefault>;
  unique(): ColumnDefinition<DataType, IsNotNull, HasDefault>;
  references<
    T extends Table<any, any>,
    ColumnName extends keyof (T extends Table<any, infer Columns> ? Columns : never)
  >(
    table: T,
    columnName: ColumnName
  ): ColumnDefinition<DataType, IsNotNull, HasDefault>;
}

export const makeColumnDefinition = <
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean
>(
  dataType: string
): ColumnDefinition<DataType, IsNotNull, HasDefault> => {
  return {
    notNull() {
      return this as any;
    },

    primaryKey() {
      return this as any;
    },

    default(defaultExpression) {
      return this as any;
    },

    check() {
      return this as any;
    },

    unique() {
      return this as any;
    },

    references(table, columnName) {
      return this as any;
    },
  };
};

export interface Column<
  Name,
  TableName,
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean,
  JoinType
> extends InternalExpression<Name, DataType, IsNotNull> {
  _columnBrand: any;

  as<AliasName extends string>(
    alias: AliasName
  ): Column<AliasName, TableName, DataType, IsNotNull, HasDefault, JoinType>;

  /** @internal */
  toTokens(): Token[];
}

export const makeColumn = <
  ColumnName,
  TableName,
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean
>(
  columnName: ColumnName,
  tableName: TableName,
  originalColumnName: string | undefined
): Column<ColumnName, TableName, DataType, IsNotNull, HasDefault, undefined> => {
  // TODO: either use some sort of AliasToken which we can later strip. Or pass some sort of option
  // to the token generation so we can choose if we want named or unnamed.

  return {
    _columnBrand: undefined,

    ...makeExpression((aliasBehaviour) => {
      const snakeCaseColumnName = toSnakeCase((columnName as unknown) as string);

      if (aliasBehaviour === `INCLUDE`) {
        return originalColumnName
          ? [new StringToken(`${tableName}.${toSnakeCase(originalColumnName)} "${columnName}"`)]
          : [
              snakeCaseColumnName === (columnName as unknown)
                ? new StringToken(`${tableName}.${snakeCaseColumnName}`)
                : new StringToken(`${tableName}.${snakeCaseColumnName} "${columnName}"`),
            ];
      }

      return originalColumnName
        ? [new StringToken(`${tableName}.${toSnakeCase(originalColumnName)}`)]
        : [new StringToken(`${tableName}.${snakeCaseColumnName}`)];
    }),

    as(alias) {
      return makeColumn(alias, tableName, (columnName as unknown) as string);
    },

    toTokens() {
      const snakeCaseColumnName = toSnakeCase((columnName as unknown) as string);

      return originalColumnName
        ? [new StringToken(`${tableName}.${toSnakeCase(originalColumnName)} "${columnName}"`)]
        : [
            snakeCaseColumnName === (columnName as unknown)
              ? new StringToken(`${tableName}.${snakeCaseColumnName}`)
              : new StringToken(`${tableName}.${snakeCaseColumnName} "${columnName}"`),
          ];
    },
  };
};
