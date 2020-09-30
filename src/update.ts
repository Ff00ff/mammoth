import {
  CollectionToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
  createQueryState,
} from './tokens';
import { GetReturning, QueryExecutorFn, ResultType } from './types';
import { getColumnData, getTableData } from './data';

import { Column } from './column';
import { Condition } from './condition';
import { Expression } from './expression';
import { Query } from './query';
import { ResultSet } from './result-set';
import { Table } from './table';

// https://www.postgresql.org/docs/12/sql-update.html
export class UpdateQuery<
  T extends Table<any, any>,
  Returning = number,
  TableColumns = T extends Table<any, infer Columns> ? Columns : never
> extends Query<Returning> {
  private _updateQueryBrand: any;

  constructor(
    private readonly queryExecutor: QueryExecutorFn,
    private readonly table: T,
    private readonly resultType: ResultType,
    private readonly tokens: Token[]
  ) {
    super();
  }

  then(
    onFulfilled?:
      | ((
          value: Returning extends number ? Returning : ResultSet<UpdateQuery<T, Returning>, false>[]
        ) => any | PromiseLike<any>)
      | undefined
      | null,
    onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null
  ) {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) =>
        onFulfilled
          ? onFulfilled(
              this.resultType === `AFFECTED_COUNT` ? result.affectedCount : (result.rows as any)
            )
          : (result as any)
      )
      .catch(onRejected);
  }

  where(condition: Condition): UpdateQuery<T, Returning> {
    return new UpdateQuery(this.queryExecutor, this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`WHERE`),
      ...condition.toTokens(),
    ]);
  }

  whereCurrentOf(cursorName: string) {
    return new UpdateQuery(this.queryExecutor, this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`WHERE CURRENT OF`),
      new ParameterToken(cursorName),
    ]);
  }

  from(fromItem: Table<any, any>): UpdateQuery<T, Returning> {
    const tableData = getTableData(fromItem);

    return new UpdateQuery(this.queryExecutor, this.table, this.resultType, [
      ...this.tokens,
      new StringToken(`FROM`),
      new StringToken(tableData.name),
    ]);
  }

  returning<C1 extends keyof TableColumns>(
    column1: C1
  ): UpdateQuery<T, GetReturning<TableColumns, C1>>;
  returning<C1 extends keyof TableColumns, C2 extends keyof TableColumns>(
    column1: C1,
    column2: C2
  ): UpdateQuery<T, GetReturning<TableColumns, C1> & GetReturning<TableColumns, C2>>;
  returning<
    C1 extends keyof TableColumns,
    C2 extends keyof TableColumns,
    C3 extends keyof TableColumns
  >(
    column1: C1,
    column2: C2,
    column3: C3
  ): UpdateQuery<
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
    column4: C4
  ): UpdateQuery<
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
    column5: C5
  ): UpdateQuery<
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
    column6: C6
  ): UpdateQuery<
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
    column7: C7
  ): UpdateQuery<
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
    column8: C8
  ): UpdateQuery<
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
    column9: C9
  ): UpdateQuery<
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
    column10: C10
  ): UpdateQuery<
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
    return new UpdateQuery(this.queryExecutor, this.table, 'ROWS', [
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
        })
      ),
    ]) as any;
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }
}

export const makeUpdate = (queryExecutor: QueryExecutorFn) => <T extends Table<any, any>>(
  table: T
) => {
  //

  return {
    set(
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
                ? DataType | Expression<DataType, boolean>
                : DataType | undefined | Expression<DataType | undefined, boolean>
              : never;
          }
        : never
    ): UpdateQuery<T, number> {
      const tableData = getTableData(table);
      const keys = Object.keys(values);

      return new UpdateQuery(queryExecutor, table, 'AFFECTED_COUNT', [
        new StringToken(`UPDATE`),
        new StringToken(tableData.name),
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
          })
        ),
      ]);
    },
  };
};
