export type ResultType = 'ROWS' | 'AFFECTED_COUNT';

export type PickByValue<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
  }[keyof T]
>;

export type GetReturning<TableColumns, ColumnName extends keyof TableColumns> = {
  [K in ColumnName]: TableColumns[K];
};

export type QueryExecutorFn = (
  query: string,
  parameters: any[],
) => Promise<{ rows: any[]; affectedCount: number }>;
