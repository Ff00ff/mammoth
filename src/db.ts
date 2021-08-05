import * as sqlFunctions from './sql-functions';

import { Column, ColumnDefinition, ColumnDefinitionFormat } from './column';
import { InsertIntoResult, makeInsertInto } from './insert';
import { SelectFn, makeSelect } from './select';
import { TableDefinition, makeTable } from './table';

import { CaseStatement } from './case';
import { QueryExecutorFn } from './types';
import { Table } from './TableType';
import { makeDeleteFrom } from './delete';
import { makeTruncate } from './truncate';
import { makeUpdate } from './update';
import { makeWith } from './with';
import { toSnakeCase } from './naming';

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
                ColumnDefinitions[K] extends ColumnDefinition<infer DataType, any, any, any>
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
    /** @internal */
    getTableDefinitions(): {
      name: string;
      originalDefinition: any;
      columns: (ColumnDefinitionFormat & { name: string })[];
    }[] {
      const tableNames = Object.keys(tableDefinitions);

      return tableNames.map((tableName) => {
        const table = tableDefinitions[tableName];
        const columnNames = Object.keys(table);

        return {
          name: tableName,
          columns: columnNames.map((columnName) => ({
            name: columnName,
            ...(table as any)[columnName].getDefinition(),
          })),
          originalDefinition: table,
        };
      });
    },
    select: makeSelect(queryExecutor),
    insertInto: makeInsertInto(queryExecutor),
    deleteFrom: makeDeleteFrom(queryExecutor),
    update: makeUpdate(queryExecutor),
    with: makeWith(queryExecutor),
    truncate: makeTruncate(queryExecutor),
    case: () => new CaseStatement<never>([]),
    ...sqlFunctions,

    ...createTables(tableDefinitions),
  };
};
