import { ColumnDefinition, InternalColumn } from './column';

import { GetResultType } from './config';

export type TableRow<T> = T extends TableDefinition<infer Columns>
  ? {
      [K in keyof Columns]: Columns[K] extends ColumnDefinition<
        infer DataType,
        infer IsNotNull,
        boolean
      >
        ? IsNotNull extends true
          ? GetResultType<DataType>
          : GetResultType<DataType> | GetResultType<'Null'>
        : never;
    }
  : never;

export class TableDefinition<Columns> {
  private _tableDefinitionBrand: any;
}

export const makeTable = <
  TableName extends string,
  TableDefinition extends { [column: string]: ColumnDefinition<any, any, any> },
>(
  tableName: TableName,
  originalTableName: string | undefined,
  tableDefinition: TableDefinition,
) => {
  const columnNames = Object.keys(
    tableDefinition as unknown as object,
  ) as (keyof TableDefinition)[];

  const columns = columnNames.reduce((map, columnName) => {
    const column = new InternalColumn(columnName as string, tableName, undefined) as any;
    map[columnName] = column;
    return map;
  }, {} as any);

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

export const defineTable = <Columns extends { [column: string]: ColumnDefinition<any, any, any> }>(
  tableDefinition: Columns,
): TableDefinition<Columns> => {
  return tableDefinition as any;
};
