import * as sqlFunctions from './sql-functions';

import { Column, ColumnDefinition, ColumnDefinitionFormat } from './column';
import { DbConfig, DefaultDbConfig } from './config';
import { InsertIntoResult, makeInsertInto } from './insert';
import { SelectFn, makeSelect } from './select';
import { TableDefinition, makeTable } from './table';

import { CaseStatement } from './case';
import { QueryExecutorFn } from './types';
import { Table } from './TableType';
import { Uuid } from './data-types';
import { makeDeleteFrom } from './delete';
import { makeUpdate } from './update';
import { makeWith } from './with';
import { toSnakeCase } from './naming';

const createTables = <
  Config extends DbConfig,
  TableDefinitions extends { [key: string]: TableDefinition<any> },
>(
  tableDefinitions: TableDefinitions,
): {
  [TableName in keyof TableDefinitions]: TableDefinitions[TableName] extends TableDefinition<
    infer ColumnDefinitions
  >
    ? Table<
        Config,
        TableName,
        {
          [K in keyof ColumnDefinitions]: K extends string
            ? Column<
                Config,
                K,
                TableName,
                ColumnDefinitions[K] extends ColumnDefinition<
                  infer DataType,
                  any,
                  any,
                  infer IsPrimaryKey
                >
                  ? DataType extends Uuid<any>
                    ? IsPrimaryKey extends true
                      ? Uuid<TableDefinitions[TableName]>
                      : DataType
                    : DataType
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

export const makeDefineDb =
  <Config extends DbConfig>() =>
  <TableDefinitions extends { [key: string]: TableDefinition<any> }>(
    tableDefinitions: TableDefinitions,
    queryExecutor: QueryExecutorFn,
  ) => {
    return {
      /** @internal */
      getQueryExecutor() {
        return queryExecutor;
      },

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
      select: makeSelect<Config>(queryExecutor),
      insertInto: makeInsertInto<Config>(queryExecutor),
      deleteFrom: makeDeleteFrom<Config>(queryExecutor),
      update: makeUpdate<Config>(queryExecutor),
      with: makeWith<Config>(queryExecutor),
      case: () => new CaseStatement<Config, never>([]),

      // TODO: should we pass Config to these sql functions?
      ...sqlFunctions,

      ...createTables<Config, TableDefinitions>(tableDefinitions),
    };
  };

export const defineDb = makeDefineDb<DefaultDbConfig>();
