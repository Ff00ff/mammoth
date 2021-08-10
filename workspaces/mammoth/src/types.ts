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

export class Maybe<T> {
  private _!: T;
}

// This is used to create a snapshot of the data type without erasing null or undefined. If the type
// is nullabe (not not null) the type is wrapped in a Maybe<T> helper class which is written in the
// snapshot as-is.
export type GetDataType<Type, IsNotNull extends boolean> = [IsNotNull] extends [true]
  ? [true] extends [IsNotNull]
    ? Type
    : Maybe<Type>
  : Maybe<Type>;

export type QueryExecutorFn = (
  query: string,
  parameters: any[],
) => Promise<{ rows: any[]; affectedCount: number }>;

export type Err<Message extends string> = {} & Message;
