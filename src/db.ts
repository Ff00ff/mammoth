import { InsertIntoResult, makeInsertInto } from "./insert";
import { SelectFn, makeSelect } from "./select";

import { QueryExecutorFn } from "./types";
import { Table } from './table';
import { makeDeleteFrom } from "./delete";
import { makeUpdate } from "./update";

export const defineDb = <Tables extends { [key: string]: Table<any, any> }>(tables: Tables, queryExecutor: QueryExecutorFn) => {
  return {
    select: makeSelect(queryExecutor),
    insertInto: makeInsertInto(queryExecutor),
    deleteFrom: makeDeleteFrom(queryExecutor),
    update: makeUpdate(queryExecutor),
    ...tables,
  };
};