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

import { Column } from './column';
import { DeleteQuery } from './delete';
import { Expression } from './expression';
import { Query } from './query';
import { ResultSet } from './result-set';
import { Table } from './TableType';
import { TableDefinition } from './table';
import { UpdateQuery } from './update';
import { wrapQuotes } from './naming';

// https://www.postgresql.org/docs/12/sql-insert.html
export class InsertQuery<
  T extends Table<any, any>,
  Returning = number,
  TableColumns = T extends Table<any, infer Columns> ? Columns : never
> extends Query<Returning> {
  private _insertQueryBrand: any;

  /** @internal */
  getReturningKeys() {
    return this.returningKeys;
  }

  constructor(
    private readonly queryExecutor: QueryExecutorFn,
    private readonly returningKeys: string[],
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
  returning(...columnNames: any[]) {
    return new InsertQuery(this.queryExecutor, columnNames, this.table, 'ROWS', [
      ...this.tokens,
      new StringToken(`RETURNING`),
      new SeparatorToken(
        `,`,
        columnNames.map((alias) => {
          const column = (this.table as any)[alias] as Column<any, any, any, any, any, any>;

          if (alias !== column.getSnakeCaseName()) {
            return new StringToken(`${column.getSnakeCaseName()} ${wrapQuotes(alias)}`);
          } else {
            return new StringToken(column.getSnakeCaseName());
          }
        }),
      ),
    ]) as any;
  }

  where(expression: Expression<boolean, boolean, string>) {
    return new InsertQuery(this.queryExecutor, this.returningKeys, this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`WHERE`),
      ...expression.toTokens(),
    ]);
  }

  onConflictOnConstraint(constraintName: string) {
    const self = this;
    return {
      doNothing() {
        return new InsertQuery(
          self.queryExecutor,
          self.returningKeys,
          self.table,
          self.resultType,
          [
            ...self.tokens,
            new StringToken(`ON CONFLICT ON CONSTRAINT`),
            new ParameterToken(constraintName),
            new StringToken(`DO NOTHING`),
          ],
        );
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
                  ? DataType | Expression<DataType, IsNotNull, any> | Query<any>
                  : DataType | undefined | Expression<DataType, IsNotNull, any> | Query<any>
                : never;
            }
          : never,
      ) {
        return new InsertQuery(
          self.queryExecutor,
          self.returningKeys,
          self.table,
          self.resultType,
          [
            ...self.tokens,
            new StringToken(`ON CONFLICT ON CONSTRAINT`),
            new ParameterToken(constraintName),
            new StringToken(`DO UPDATE SET`),
            new SeparatorToken(
              `,`,
              Object.keys(values).map((columnName) => {
                const column = (self.table as any)[columnName] as Column<
                  any,
                  any,
                  any,
                  any,
                  any,
                  any
                >;
                const value = (values as any)[columnName];

                if (
                  value &&
                  typeof value === `object` &&
                  'toTokens' in value &&
                  typeof value.toTokens === `function`
                ) {
                  return new CollectionToken([
                    new StringToken(column.getSnakeCaseName()),
                    new StringToken(`=`),
                    // TODO: should we add a group here-o?
                    ...value.toTokens(),
                  ]);
                } else {
                  return new CollectionToken([
                    new StringToken(column.getSnakeCaseName()),
                    new StringToken(`=`),
                    new ParameterToken(value),
                  ]);
                }
              }),
            ),
          ],
        );
      },
    };
  }

  onConflict<ColumnNames extends T extends Table<any, infer Columns> ? (keyof Columns)[] : never>(
    ...columnNames: ColumnNames
  ) {
    const self = this;
    return {
      doNothing() {
        return new InsertQuery(
          self.queryExecutor,
          self.returningKeys,
          self.table,
          self.resultType,
          [
            ...self.tokens,
            new StringToken(`ON CONFLICT`),
            columnNames.length > 0
              ? new GroupToken(
                  columnNames.map((columnName) => {
                    const column = (self.table as any)[columnName] as Column<
                      any,
                      any,
                      any,
                      any,
                      any,
                      any
                    >;

                    return new StringToken(column.getSnakeCaseName());
                  }),
                )
              : new EmptyToken(),
            new StringToken(`DO NOTHING`),
          ],
        );
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
                  ? DataType | Expression<DataType, IsNotNull, any> | Query<any>
                  : DataType | undefined | Expression<DataType, IsNotNull, any> | Query<any>
                : never;
            }
          : never,
      ) {
        return new InsertQuery(
          self.queryExecutor,
          self.returningKeys,
          self.table,
          self.resultType,
          [
            ...self.tokens,
            new StringToken(`ON CONFLICT`),
            columnNames.length > 0
              ? new GroupToken(
                  columnNames.map((columnName) => {
                    const column = (self.table as any)[columnName] as Column<
                      any,
                      any,
                      any,
                      any,
                      any,
                      any
                    >;
                    return new StringToken(column.getSnakeCaseName());
                  }),
                )
              : new EmptyToken(),
            new StringToken(`DO UPDATE SET`),
            new SeparatorToken(
              `,`,
              Object.keys(values).map((columnName) => {
                const column = (self.table as any)[columnName] as Column<
                  any,
                  any,
                  any,
                  any,
                  any,
                  any
                >;
                const value = (values as any)[columnName];

                if (
                  value &&
                  typeof value === `object` &&
                  'toTokens' in value &&
                  typeof value.toTokens === `function`
                ) {
                  return new CollectionToken([
                    new StringToken(column.getSnakeCaseName()),
                    new StringToken(`=`),
                    // TODO: should we add a group here-o?
                    ...value.toTokens(),
                  ]);
                } else {
                  return new CollectionToken([
                    new StringToken(column.getSnakeCaseName()),
                    new StringToken(`=`),
                    new ParameterToken(value),
                  ]);
                }
              }),
            ),
          ],
        );
      },
    };
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }
}

export interface InsertIntoResult<
  T extends Table<any, any>,
  Row = T extends Table<any, infer Columns>
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
    : never
> {
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
                ? DataType | Expression<DataType, boolean, any>
                : DataType | undefined | Expression<DataType | undefined, boolean, any>
              : never;
          }
        : never,
    ): UpdateQuery<UpdateTable, number>;
  };

  defaultValues(): InsertQuery<T, number>;
  values(values: Row | Row[]): InsertQuery<T, number>;
}

export const makeInsertInto = (queryExecutor: QueryExecutorFn) => <T extends Table<any, any>>(
  table: T,
  columnNames?: T extends Table<any, infer Columns> ? (keyof Columns)[] : never,
): T extends TableDefinition<any> ? never : InsertIntoResult<T> => {
  type Row = T extends Table<any, infer Columns>
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
    : never;

  return {
    select: makeSelect(queryExecutor, [
      new StringToken(`INSERT INTO`),
      new StringToken((table as Table<any, any>).getName()),
      new GroupToken([
        new SeparatorToken(
          `,`,
          columnNames?.map((columnName) => {
            const column = (table as any)[columnName] as Column<any, any, any, any, any, any>;

            return new StringToken(column.getSnakeCaseName());
          }) || [],
        ),
      ]),
    ]),

    deleteFrom<DeleteTable extends Table<any, any>>(deleteTable: DeleteTable) {
      return new DeleteQuery<DeleteTable, number>(
        queryExecutor,
        [],
        deleteTable,
        'AFFECTED_COUNT',
        [
          new StringToken(`INSERT INTO`),
          new StringToken((table as Table<any, any>).getName()),
          new GroupToken([
            new SeparatorToken(
              `,`,
              columnNames!.map((columnName) => {
                const column = (table as any)[columnName] as Column<any, any, any, any, any, any>;

                return new StringToken(column.getSnakeCaseName());
              }),
            ),
          ]),
          new StringToken(`DELETE FROM`),
          new StringToken((deleteTable as Table<any, any>).getName()),
        ],
      );
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
                    ? DataType | Expression<DataType, boolean, any>
                    : DataType | undefined | Expression<DataType | undefined, boolean, any>
                  : never;
              }
            : never,
        ): UpdateQuery<T, number> {
          const keys = Object.keys(values);

          return new UpdateQuery(queryExecutor, [], table, 'AFFECTED_COUNT', [
            new StringToken(`INSERT INTO`),
            new StringToken((table as Table<any, any>).getName()),
            new GroupToken([
              new SeparatorToken(
                `,`,
                columnNames!.map((columnName) => {
                  const column = (table as any)[columnName] as Column<any, any, any, any, any, any>;

                  return new StringToken(column.getSnakeCaseName());
                }),
              ),
            ]),
            new StringToken(`UPDATE`),
            new StringToken((updateTable as Table<any, any>).getName()),
            new StringToken(`SET`),
            new SeparatorToken(
              `,`,
              keys.map((key) => {
                const column = (table as any)[key] as Column<any, any, any, any, any, any>;
                const value = (values as any)[key];

                return new CollectionToken([
                  new StringToken(column.getSnakeCaseName()),
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
      return new InsertQuery(queryExecutor, [], table, 'AFFECTED_COUNT', [
        new StringToken(`INSERT INTO`),
        new StringToken((table as Table<any, any>).getName()),
        new StringToken(`DEFAULT VALUES`),
      ]);
    },

    // Here we create a type where all optional columns are nullable and the other columns are
    // required. Even though not strictly correct: we also assume a column containing a default
    // clause is not required. This is so you do not need to specify an undefined id when inserting
    // a row.
    values(listOrItem: Row | Row[]): InsertQuery<T, number> {
      const list = Array.isArray(listOrItem) ? listOrItem : [listOrItem];
      const [firstItem] = list;

      return new InsertQuery(queryExecutor, [], table, 'AFFECTED_COUNT', [
        new StringToken(`INSERT INTO`),
        new StringToken((table as Table<any, any>).getName()),
        new GroupToken([
          new SeparatorToken(
            `,`,
            Object.keys(firstItem).map((columnName) => {
              const column = (table as any)[columnName] as Column<any, any, any, any, any, any>;

              return new StringToken(column.getSnakeCaseName());
            }),
          ),
        ]),
        new StringToken(`VALUES`),
        new SeparatorToken(
          ',',
          list.map((values) => {
            return new GroupToken([
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
            ]);
          }),
        ),
      ]);
    },
  } as any;
};
