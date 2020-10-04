import { Column, ColumnDefinition } from './column';
import { InsertIntoResult, makeInsertInto } from './insert';
import { SelectFn, makeSelect } from './select';
import { Table, TableDefinition, makeTable } from './table';

import { QueryExecutorFn } from './types';
import { makeDeleteFrom } from './delete';
import { makeUpdate } from './update';
import { makeWith } from './with';
import { toSnakeCase } from './naming/snake-case';

const createTables = <TableDefinitions extends { [key: string]: TableDefinition<any> }>(
  tableDefinitions: TableDefinitions,
): {
  [TableName in keyof TableDefinitions]: TableDefinitions[TableName] extends TableDefinition<
    infer ColumnDefinitions
  >
    ? Table<
        TableName,
        {
          [K in keyof ColumnDefinitions]: K extends string
            ? Column<
                K,
                TableName,
                ColumnDefinitions[K] extends ColumnDefinition<infer DataType, any, any>
                  ? DataType
                  : never,
                ColumnDefinitions[K] extends ColumnDefinition<any, infer IsNotNull, any>
                  ? IsNotNull
                  : never,
                ColumnDefinitions[K] extends ColumnDefinition<any, any, infer HasDefault>
                  ? HasDefault
                  : never,
                undefined
              >
            : never;
        }
      >
    : never;
} => {
  return Object.keys(tableDefinitions).reduce((tables, key) => {
    const tableDefinition = tableDefinitions[key];

    tables[key] = makeTable(toSnakeCase(key), undefined, tableDefinition as any);

    return tables;
  }, {} as any);
};

export const defineDb = <TableDefinitions extends { [key: string]: TableDefinition<any> }>(
  tableDefinitions: TableDefinitions,
  queryExecutor: QueryExecutorFn,
) => {
  return {
    select: makeSelect(queryExecutor),
    insertInto: makeInsertInto(queryExecutor),
    deleteFrom: makeDeleteFrom(queryExecutor),
    update: makeUpdate(queryExecutor),
    with: makeWith(queryExecutor),

    ...createTables(tableDefinitions),
  };
};
