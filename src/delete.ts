import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
  createQueryState,
} from './tokens';
import type { GetReturning, QueryExecutorFn, ResultType } from './types';

import { Column } from './column';
import { Expression } from './expression';
import { Query } from './query';
import type { ResultSet } from './result-set';
import type { Table } from './TableType';
import type { TableDefinition } from './table';
import { wrapQuotes } from './naming';

export const makeDeleteFrom =
  (queryExecutor: QueryExecutorFn) =>
  <T extends Table<any, any>>(
    table: T,
  ): T extends TableDefinition<any> ? never : DeleteQuery<T> => {
    return new DeleteQuery<T>(queryExecutor, [], table, 'AFFECTED_COUNT', [
      new StringToken(`DELETE FROM`),
      new StringToken((table as Table<any, any>).getName()),
    ]) as any;
  };

// https://www.postgresql.org/docs/12/sql-delete.html
export class DeleteQuery<
  T extends Table<any, any>,
  Returning = number,
  TableColumns = T extends Table<any, infer Columns> ? Columns : never,
> extends Query<Returning> {
  private _deleteQueryBrand: any;

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

  then<Result1, Result2 = never>(
    onFulfilled?:
      | ((
          value: Returning extends number ? number : ResultSet<DeleteQuery<T, Returning>, false>[],
        ) => Result1 | PromiseLike<Result1>)
      | undefined
      | null,
    onRejected?: ((reason: any) => Result2 | PromiseLike<Result2>) | undefined | null,
  ): Promise<Result1 | Result2> {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) =>
        onFulfilled
          ? onFulfilled(
              this.resultType === `AFFECTED_COUNT` ? result.affectedCount : (result.rows as any),
            )
          : (result as any),
      )
      .catch(onRejected);
  }

  using(...fromItems: Table<any, any>[]): DeleteQuery<T, Returning> {
    return new DeleteQuery(this.queryExecutor, [], this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`USING`),
      new SeparatorToken(
        `,`,
        fromItems.map((fromItem) => {
          return new StringToken(fromItem.getName());
        }),
      ),
    ]);
  }

  where(condition: Expression<boolean, boolean, string>): DeleteQuery<T, Returning> {
    return new DeleteQuery(this.queryExecutor, [], this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`WHERE`),
      ...condition.toTokens(),
    ]);
  }

  whereCurrentOf(cursorName: string): DeleteQuery<T, Returning> {
    return new DeleteQuery(this.queryExecutor, [], this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`WHERE CURRENT OF`),
      new ParameterToken(cursorName),
    ]);
  }

  returning<C1 extends keyof (T extends Table<string, infer Columns> ? Columns : never)>(
    column1: C1,
  ): DeleteQuery<T, GetReturning<T extends Table<string, infer Columns> ? Columns : never, C1>>;
  returning<C1 extends keyof TableColumns, C2 extends keyof TableColumns>(
    column1: C1,
    column2: C2,
  ): DeleteQuery<T, GetReturning<TableColumns, C1> & GetReturning<TableColumns, C2>>;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
  >(
    column1: C1,
    column2: C2,
    column3: C3,
  ): DeleteQuery<
    T,
    GetReturning<TableColumns, C1> & GetReturning<TableColumns, C2> & GetReturning<TableColumns, C3>
  >;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns,
    C4 extends keyof TableColumns,
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
  ): DeleteQuery<
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
    C5 extends keyof TableColumns,
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
  ): DeleteQuery<
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
    C6 extends keyof TableColumns,
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
  ): DeleteQuery<
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
    C7 extends keyof TableColumns,
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
    column7: C7,
  ): DeleteQuery<
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
    C8 extends keyof TableColumns,
  >(
    column1: C1,
    column2: C2,
    column3: C3,
    column4: C4,
    column5: C5,
    column6: C6,
    column7: C7,
    column8: C8,
  ): DeleteQuery<
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
    C9 extends keyof TableColumns,
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
  ): DeleteQuery<
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
    C10 extends keyof TableColumns,
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
  ): DeleteQuery<
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
    return new DeleteQuery(this.queryExecutor, columnNames, this.table, 'ROWS', [
      ...this.tokens,
      new StringToken(`RETURNING`),
      new SeparatorToken(
        `,`,
        columnNames.map((alias) => {
          const column = (this.table as any)[alias] as Column<any, any, any, any, any, any>;

          if (alias !== column.getSnakeCaseName()) {
            return new StringToken(`${wrapQuotes(column.getSnakeCaseName())} ${wrapQuotes(alias)}`);
          } else {
            return new StringToken(wrapQuotes(column.getSnakeCaseName()));
          }
        }),
      ),
    ]) as any;
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }
}
