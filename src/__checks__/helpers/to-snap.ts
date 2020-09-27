import { Query } from "../../query";
import { ResultSet } from "../../result-set";

export const toSnap = <T extends Query<any>>(query: T): ResultSet<T, true> => {
  return undefined as any;
};