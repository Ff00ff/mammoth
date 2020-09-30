import {
  CollectionToken,
  EmptyToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
  createQueryState,
} from './tokens';
import { GetReturning, PickByValue, QueryExecutorFn, ResultType } from './types';
import { SelectFn, makeSelect } from './select';
import { Table, TableDefinition } from './table';
import { getColumnData, getTableData } from './data';

import { Column } from './column';
import { Condition } from './condition';
import { DeleteQuery } from './delete';
import { Expression } from './expression';
import { Query } from './query';
import { ResultSet } from './result-set';
import { UpdateQuery } from './update';

// https://www.postgresql.org/docs/12/sql-insert.html
export class InsertQuery<
  T extends Table<any, any>,
  Returning = number,
  TableColumns = T extends Table<any, infer Columns> ? Columns : never
> extends Query<Returning> {
  private _insertQueryBrand: any;

  constructor(
    private readonly queryExecutor: QueryExecutorFn,
    private readonly table: T,
    private readonly resultType: ResultType,
    private readonly tokens: Token[],
  ) {
    super();
  }

  then(
    onFulfilled?:
      | ((
          value: Returning extends number
            ? Returning
            : ResultSet<InsertQuery<T, Returning>, false>[],
        ) => any | PromiseLike<any>)
      | undefined
      | null,
    onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null,
  ) {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) =>
        onFulfilled
          ? onFulfilled(
              this.resultType === `AFFECTED_COUNT` ? result.affectedCount : (result.rows as any),
            )
          : result,
      )
      .catch(onRejected);
  }

  returning<C1 extends keyof TableColumns>(
    column1: C1,
  ): InsertQuery<T, GetReturning<TableColumns, C1>>;
  returning<C1 extends keyof TableColumns, C2 extends keyof TableColumns>(
    column1: C1,
    column2: C2,
  ): InsertQuery<T, GetReturning<TableColumns, C1> & GetReturning<TableColumns, C2>>;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> & GetReturning<TableColumns, C2> & GetReturning<TableColumns, C3>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
    C5 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4> &
      GetReturning<TableColumns, C5>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
    C5 extends keyof TableColumns,
    C6 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4> &
      GetReturning<TableColumns, C5> &
      GetReturning<TableColumns, C6>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
    C5 extends keyof TableColumns,
    C6 extends keyof TableColumns,
    C7 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
    column7: C7,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4> &
      GetReturning<TableColumns, C5> &
      GetReturning<TableColumns, C6> &
      GetReturning<TableColumns, C7>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
    C5 extends keyof TableColumns,
    C6 extends keyof TableColumns,
    C7 extends keyof TableColumns,
    C8 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
    column7: C7,
    column8: C8,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4> &
      GetReturning<TableColumns, C5> &
      GetReturning<TableColumns, C6> &
      GetReturning<TableColumns, C7> &
      GetReturning<TableColumns, C8>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
    C5 extends keyof TableColumns,
    C6 extends keyof TableColumns,
    C7 extends keyof TableColumns,
    C8 extends keyof TableColumns,
    C9 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
    column7: C7,
    column8: C8,
    column9: C9,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4> &
      GetReturning<TableColumns, C5> &
      GetReturning<TableColumns, C6> &
      GetReturning<TableColumns, C7> &
      GetReturning<TableColumns, C8> &
      GetReturning<TableColumns, C9>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
    C5 extends keyof TableColumns,
    C6 extends keyof TableColumns,
    C7 extends keyof TableColumns,
    C8 extends keyof TableColumns,
    C9 extends keyof TableColumns,
    C10 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
    column7: C7,
    column8: C8,
    column9: C9,
    column10: C10,
  ): InsertQuery<
    T,
    GetReturning<TableColumns, C1> &
      GetReturning<TableColumns, C2> &
      GetReturning<TableColumns, C3> &
      GetReturning<TableColumns, C4> &
      GetReturning<TableColumns, C5> &
      GetReturning<TableColumns, C6> &
      GetReturning<TableColumns, C7> &
      GetReturning<TableColumns, C8> &
      GetReturning<TableColumns, C9> &
      GetReturning<TableColumns, C10>
  >;
  returning(...columns: any[]) {
    return new InsertQuery(this.queryExecutor, this.table, 'ROWS', [
      ...this.tokens,
      new StringToken(`RETURNING`),
      new SeparatorToken(
        `,`,
        columns.map((alias) => {
          const columnData = getColumnData((this.table as any)[alias]);

          if (alias !== columnData.snakeCaseName) {
            return new StringToken(`${columnData.snakeCaseName} "${alias}"`);
          } else {
            return new StringToken(columnData.snakeCaseName);
          }
        }),
      ),
    ]) as any;
  }

  where(condition: Condition) {
    return new InsertQuery(this.queryExecutor, this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`WHERE`),
      ...condition.toTokens(),
    ]);
  }

  onConflictOnConstraint(constraintName: string) {
    const self = this;
    return {
      doNothing() {
        return new InsertQuery(self.queryExecutor, self.table, self.resultType, [
          ...self.tokens,
          new StringToken(`ON CONFLICT ON CONSTRAINT`),
          new ParameterToken(constraintName),
          new StringToken(`DO NOTHING`),
        ]);
      },

      doUpdateSet(
        values: T extends Table<any, infer Columns>
          ? {
              [K in keyof Columns]?: Columns[K] extends Column<
                any,
                any,
                infer DataType,
                infer IsNotNull,
                any,
                any
              >
                ? IsNotNull extends true
                  ? DataType | Expression<DataType, IsNotNull> | Query<any>
                  : DataType | undefined | Expression<DataType, IsNotNull> | Query<any>
                : never;
            }
          : never,
      ) {
        return new InsertQuery(self.queryExecutor, self.table, self.resultType, [
          ...self.tokens,
          new StringToken(`ON CONFLICT ON CONSTRAINT`),
          new ParameterToken(constraintName),
          new StringToken(`DO UPDATE SET`),
          new SeparatorToken(
            `,`,
            Object.keys(values).map((columnName) => {
              const column = (self.table as any)[columnName];
              const value = (values as any)[columnName];
              const columnData = getColumnData(column);

              if (
                value &&
                typeof value === `object` &&
                'toTokens' in value &&
                typeof value.toTokens === `function`
              ) {
                return new CollectionToken([
                  new StringToken(columnData.snakeCaseName),
                  new StringToken(`=`),
                  // TODO: should we add a group here-o?
                  ...value.toTokens(),
                ]);
              } else {
                return new CollectionToken([
                  new StringToken(columnData.snakeCaseName),
                  new StringToken(`=`),
                  new ParameterToken(value),
                ]);
              }
            }),
          ),
        ]);
      },
    };
  }

  onConflict<ColumnNames extends T extends Table<any, infer Columns> ? (keyof Columns)[] : never>(
    ...columnNames: ColumnNames
  ) {
    const self = this;
    return {
      doNothing() {
        return new InsertQuery(self.queryExecutor, self.table, self.resultType, [
          ...self.tokens,
          new StringToken(`ON CONFLICT`),
          columnNames.length > 0
            ? new GroupToken(
                columnNames.map((columnName) => {
                  const column = (self.table as any)[columnName];
                  const columnData = getColumnData(column);

                  return new StringToken(columnData.snakeCaseName);
                }),
              )
            : new EmptyToken(),
          new StringToken(`DO NOTHING`),
        ]);
      },

      doUpdateSet(
        values: T extends Table<any, infer Columns>
          ? {
              [K in keyof Columns]?: Columns[K] extends Column<
                any,
                any,
                infer DataType,
                infer IsNotNull,
                any,
                any
              >
                ? IsNotNull extends true
                  ? DataType | Expression<DataType, IsNotNull> | Query<any>
                  : DataType | undefined | Expression<DataType, IsNotNull> | Query<any>
                : never;
            }
          : never,
      ) {
        return new InsertQuery(self.queryExecutor, self.table, self.resultType, [
          ...self.tokens,
          new StringToken(`ON CONFLICT`),
          columnNames.length > 0
            ? new GroupToken(
                columnNames.map((columnName) => {
                  const column = (self.table as any)[columnName];
                  const columnData = getColumnData(column);

                  return new StringToken(columnData.snakeCaseName);
                }),
              )
            : new EmptyToken(),
          new StringToken(`DO UPDATE SET`),
          new SeparatorToken(
            `,`,
            Object.keys(values).map((columnName) => {
              const column = (self.table as any)[columnName];
              const value = (values as any)[columnName];
              const columnData = getColumnData(column);

              if (
                value &&
                typeof value === `object` &&
                'toTokens' in value &&
                typeof value.toTokens === `function`
              ) {
                return new CollectionToken([
                  new StringToken(columnData.snakeCaseName),
                  new StringToken(`=`),
                  // TODO: should we add a group here-o?
                  ...value.toTokens(),
                ]);
              } else {
                return new CollectionToken([
                  new StringToken(columnData.snakeCaseName),
                  new StringToken(`=`),
                  new ParameterToken(value),
                ]);
              }
            }),
          ),
        ]);
      },
    };
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }
}

export interface InsertIntoResult<T extends Table<any, any>> {
  select: SelectFn;

  deleteFrom<DeleteTable extends Table<any, any>>(
    deleteTable: DeleteTable,
  ): DeleteQuery<DeleteTable, number>;

  update<UpdateTable extends Table<any, any>>(
    updateTable: UpdateTable,
  ): {
    set(
      values: UpdateTable extends Table<any, infer Columns>
        ? {
            [K in keyof Columns]?: Columns[K] extends Column<
              any,
              any,
              infer DataType,
              infer IsNotNull,
              any,
              any
            >
              ? IsNotNull extends true
                ? DataType | Expression<DataType, boolean>
                : DataType | undefined | Expression<DataType | undefined, boolean>
              : never;
          }
        : never,
    ): UpdateQuery<UpdateTable, number>;
  };

  defaultValues(): InsertQuery<T, number>;
  values(
    values: T extends Table<any, infer Columns>
      ? {
          [K in keyof PickByValue<
            {
              [K in keyof Columns]: Columns[K] extends Column<
                any,
                any,
                any,
                infer IsNotNull,
                infer HasDefault,
                any
              >
                ? HasDefault extends true
                  ? false
                  : IsNotNull
                : never;
            },
            true
          >]: Columns[K] extends Column<any, any, infer DataType, any, any, any> ? DataType : never;
        } &
          {
            [K in keyof PickByValue<
              {
                [K in keyof Columns]: Columns[K] extends Column<
                  any,
                  any,
                  any,
                  boolean,
                  infer HasDefault,
                  any
                >
                  ? HasDefault extends true
                    ? false
                    : false
                  : never;
              },
              false
            >]?: Columns[K] extends Column<any, any, infer DataType, any, any, any>
              ? DataType | undefined
              : never;
          }
      : never,
  ): InsertQuery<T, number>;
}

export const makeInsertInto = (queryExecutor: QueryExecutorFn) => <T extends Table<any, any>>(
  table: T,
  columnNames?: T extends Table<any, infer Columns> ? (keyof Columns)[] : never,
): T extends TableDefinition<any> ? never : InsertIntoResult<T> => {
  const insertTableData = getTableData(table);
  return {
    select: makeSelect(queryExecutor, [
      new StringToken(`INSERT INTO`),
      new StringToken(insertTableData.name),
      new GroupToken([
        new SeparatorToken(
          `,`,
          columnNames?.map((columnName) => {
            const columnData = getColumnData((table as any)[columnName]);

            return new StringToken(columnData.snakeCaseName);
          }) || [],
        ),
      ]),
    ]),

    deleteFrom<DeleteTable extends Table<any, any>>(deleteTable: DeleteTable) {
      const deleteTableData = getTableData(deleteTable);
      const insertTableData = getTableData(table);

      return new DeleteQuery<DeleteTable, number>(queryExecutor, deleteTable, 'AFFECTED_COUNT', [
        new StringToken(`INSERT INTO`),
        new StringToken(insertTableData.name),
        new GroupToken([
          new SeparatorToken(
            `,`,
            columnNames!.map((columnName) => {
              const columnData = getColumnData((table as any)[columnName]);

              return new StringToken(columnData.snakeCaseName);
            }),
          ),
        ]),
        new StringToken(`DELETE FROM`),
        new StringToken(deleteTableData.name),
      ]);
    },

    update<UpdateTable extends Table<any, any>>(updateTable: UpdateTable) {
      return {
        set(
          values: UpdateTable extends Table<any, infer Columns>
            ? {
                [K in keyof Columns]?: Columns[K] extends Column<
                  any,
                  any,
                  infer DataType,
                  infer IsNotNull,
                  any,
                  any
                >
                  ? IsNotNull extends true
                    ? DataType | Expression<DataType, boolean>
                    : DataType | undefined | Expression<DataType | undefined, boolean>
                  : never;
              }
            : never,
        ): UpdateQuery<T, number> {
          const updateTableData = getTableData(updateTable);
          const keys = Object.keys(values);

          return new UpdateQuery(queryExecutor, table, 'AFFECTED_COUNT', [
            new StringToken(`INSERT INTO`),
            new StringToken(insertTableData.name),
            new GroupToken([
              new SeparatorToken(
                `,`,
                columnNames!.map((columnName) => {
                  const columnData = getColumnData((table as any)[columnName]);

                  return new StringToken(columnData.snakeCaseName);
                }),
              ),
            ]),
            new StringToken(`UPDATE`),
            new StringToken(updateTableData.name),
            new StringToken(`SET`),
            new SeparatorToken(
              `,`,
              keys.map((key) => {
                const columnData = getColumnData((table as any)[key]);
                const value = (values as any)[key];

                return new CollectionToken([
                  new StringToken(columnData.snakeCaseName),
                  new StringToken(`=`),
                  value && typeof value === `object` && 'toTokens' in value
                    ? value.toTokens()
                    : new ParameterToken(value),
                ]);
              }),
            ),
          ]);
        },
      };
    },

    defaultValues() {
      return new InsertQuery(queryExecutor, table, 'AFFECTED_COUNT', [
        new StringToken(`INSERT INTO`),
        new StringToken(insertTableData.name),
        new StringToken(`DEFAULT VALUES`),
      ]);
    },

    // Here we create a type where all optional columns are nullable and the other columns are
    // required. Even though not strictly correct: we also assume a column containing a default
    // clause is not required. This is so you do not need to specify an undefined id when inserting
    // a row.
    values(
      values: T extends Table<any, infer Columns>
        ? {
            [K in keyof PickByValue<
              {
                [K in keyof Columns]: Columns[K] extends Column<
                  any,
                  any,
                  any,
                  infer IsNotNull,
                  infer HasDefault,
                  any
                >
                  ? HasDefault extends true
                    ? false
                    : IsNotNull
                  : never;
              },
              true
            >]: Columns[K] extends Column<any, any, infer DataType, any, any, any>
              ? DataType
              : never;
          } &
            {
              [K in keyof PickByValue<
                {
                  [K in keyof Columns]: Columns[K] extends Column<
                    any,
                    any,
                    any,
                    infer IsNotNull,
                    infer HasDefault,
                    any
                  >
                    ? HasDefault extends true
                      ? false
                      : IsNotNull
                    : never;
                },
                false
              >]?: Columns[K] extends Column<any, any, infer DataType, any, any, any>
                ? DataType | undefined
                : never;
            }
        : never,
    ): InsertQuery<T, number> {
      return new InsertQuery(queryExecutor, table, 'AFFECTED_COUNT', [
        new StringToken(`INSERT INTO`),
        new StringToken(insertTableData.name),
        new GroupToken([
          new SeparatorToken(
            `,`,
            Object.keys(values).map((columnName) => {
              const column = (table as any)[columnName];
              const columnData = getColumnData(column);

              return new StringToken(columnData.snakeCaseName);
            }),
          ),
        ]),
        new StringToken(`VALUES`),
        new GroupToken([
          new SeparatorToken(
            `,`,
            Object.keys(values).map((columnName) => {
              const value = (values as any)[columnName];

              if (
                value &&
                typeof value === `object` &&
                'toTokens' in value &&
                typeof value.toTokens === `function`
              ) {
                return new CollectionToken(value.toTokens());
              } else {
                return new ParameterToken(value);
              }
            }),
          ),
        ]),
      ]);
    },
  } as any;
};
