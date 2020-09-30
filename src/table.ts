// type InternalTab<TableDefinitionName> = Nominal<TableDefinitionName>;

import { Column, ColumnDefinition, makeColumn } from './column';
import { internalColumnData, internalTableData } from './data';

import { toSnakeCase } from './naming/snake-case';

export class TableDefinition<Columns> {
  private _tableDefinitionBrand: any;
}

export type Table<TableName, Columns> = Columns & InternalTable<TableName, Columns>;

interface InternalTable<TableName, Columns> {
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

export const makeTable = <
  TableName extends string,
  TableDefinition extends { [column: string]: ColumnDefinition<any, any, any> }
>(
  tableName: TableName,
  originalTableName: string | undefined,
  tableDefinition: TableDefinition,
) => {
  const columnNames = Object.keys(
    (tableDefinition as unknown) as object,
  ) as (keyof TableDefinition)[];

  const columns = columnNames.reduce(
    (map, columnName) => {
      const column = makeColumn(columnName as string, tableName, undefined) as any;
      internalColumnData.set(column, {
        snakeCaseName: toSnakeCase(columnName as string),
      });
      map[columnName] = column;
      return map;
    },
    {} as Table<
      TableName,
      {
        [K in keyof TableDefinition]: Column<
          K,
          TableName,
          TableDefinition[K] extends ColumnDefinition<infer DataType, any, any> ? DataType : never,
          TableDefinition[K] extends ColumnDefinition<any, infer IsNotNull, any>
            ? IsNotNull
            : never,
          TableDefinition[K] extends ColumnDefinition<any, any, infer HasDefault>
            ? HasDefault
            : never,
          undefined
        >;
      }
    >,
  );

  const table = {
    ...columns,
    as<T extends string>(alias: T) {
      return makeTable(alias, tableName, tableDefinition) as any;
    },
  };
  internalTableData.set(table, {
    name: tableName,
    originalName: originalTableName,
  });
  return table;
};

export const defineTable = <Columns extends { [column: string]: ColumnDefinition<any, any, any> }>(
  tableDefinition: Columns,
): TableDefinition<Columns> => {
  return tableDefinition as any;
};
