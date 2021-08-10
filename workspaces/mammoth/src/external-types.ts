import { Table } from './TableType';

export type GetColumn<T> = T extends Table<any, any, infer Columns>
  ? { [K in keyof Columns]: Columns[K] }[keyof Columns]
  : false;
