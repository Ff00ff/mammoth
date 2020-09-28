import { QueryExecutorFn } from "./types";
import { makeDeleteFrom } from "./delete";
import { makeInsertInto } from "./insert";
import { makeSelect } from "./select";
import { makeUpdate } from "./update";

export const defineDb = (queryExecutor: QueryExecutorFn) => {
  return {
    select: makeSelect(queryExecutor),
    insertInto: makeInsertInto(queryExecutor),
    deleteFrom: makeDeleteFrom(queryExecutor),
    update: makeUpdate(queryExecutor),
  };
};