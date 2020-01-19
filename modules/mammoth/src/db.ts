// import { Table } from './table';
// import { ColumnWrapper } from '../../../lib';
// import { SplitOptionalAndRequired, toType, SparseArray } from './types';
// import { SelectQuery, InsertQuery, DeleteQuery, UpdateQuery } from '../../../lib/query';

// interface TableMap {
//   [tableName: string]: any;
// }

// export class Db {
//   private backend = new PgBackend();
//   private tables: { [tableName: string]: Table<any, any, any> } = {};

//   constructor(databaseUrl: string, userDefinedTables: TableMap) {
//     const tableNames = Object.keys(userDefinedTables);

//     tableNames.forEach(tableName => {
//       const table = userDefinedTables[tableName];

//       this.tables[tableName] = new Table<any, any, any>(table, tableName);

//       Object.defineProperty(this, tableName, {
//         get() {
//           return this.tables[tableName];
//         },
//       });
//     });

//     tableNames.forEach(tableName => {
//       const table = this.tables[tableName];
//       table.init(this);
//     });
//   }

//   transaction<Callback extends (db: this) => Promise<any>>(
//     callback: Callback,
//   ): ReturnType<Callback> {
//     //

//     return 0 as any;
//   }

//   sql(strings: TemplateStringsArray, ...parameters: any[]) {
//     const text = strings.reduce(
//       (query, string, index) =>
//         query + string + (index < parameters.length ? `$${String(index + 1)}` : ``),
//       ``,
//     );

//     // TODO: pass this to the backend.
//   }
// }

// type Schema<UserDefinedTables extends TableMap> = {
//   [TableName in keyof UserDefinedTables]: Table<
//     // Selectable columns
//     {
//       [ColumnName in keyof UserDefinedTables[TableName]]: toType<
//         UserDefinedTables[TableName][ColumnName]['selectType']
//       >
//     },
//     // Insertable columns
//     SplitOptionalAndRequired<UserDefinedTables[TableName], 'insertType'>,
//     // Update -- can't we just get rid of this as this is basically the regular column types but
//     // everything is optional?
//     SplitOptionalAndRequired<UserDefinedTables[TableName], 'updateType'>
//   > &
//     {
//       [ColumnName in keyof UserDefinedTables[TableName]]: ColumnWrapper<
//         ColumnName,
//         UserDefinedTables[TableName][ColumnName]['type'],
//         UserDefinedTables[TableName][ColumnName]['selectType'],
//         UserDefinedTables[TableName][ColumnName]['insertType'],
//         UserDefinedTables[TableName][ColumnName]['updateType']
//       >
//     }
// };

// export const createDatabase2 = <UserDefinedTables extends TableMap>(
//   databaseUrl: string,
//   userDefinedTables: UserDefinedTables,
// ): Schema<UserDefinedTables> & Db => {
//   return new Db(databaseUrl, userDefinedTables) as any;
// };
