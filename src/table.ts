import { Column, ColumnDefinition } from './column';

import { Table } from './TableType';

export type TableRow<T> = T extends TableDefinition<infer Columns>
  ? {
      [K in keyof Columns]: Columns[K] extends ColumnDefinition<
        infer DataType,
        infer IsNotNull,
        boolean
      >
        ? IsNotNull extends true
          ? DataType
          : DataType | null
        : never;
    }
  : never;

export class TableDefinition<Columns> {
  private _tableDefinitionBrand: any;
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
      const column = new Column(columnName as string, tableName, undefined) as any;
      map[columnName] = column;
      return map;
    },
    {} as Table<
      TableName,
      {
        [K in keyof TableDefinition]: K extends string
          ? TableDefinition[K] extends ColumnDefinition<infer DataType, infer IsNotNull, infer HasDefault>
            ? Column<K, TableName, DataType, IsNotNull, HasDefault, undefined>
            : never
          : never;
      }
    >,
  );

  const table = {
    ...columns,
    as<T extends string>(alias: T) {
      return makeTable(alias, tableName, tableDefinition) as any;
    },
    getName() {
      return tableName;
    },
    getOriginalName() {
      return originalTableName;
    },
  };
  return table;
};

export const defineTable = <Columns extends { [column: string]: ColumnDefinition<any, boolean, boolean> }>(
  tableDefinition: Columns,
): TableDefinition<Columns> => {
  return tableDefinition as any;
};
