import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
  createQueryState,
} from './tokens';
import { Expression, NamedExpression } from './expression';

import { Column } from './column';
import { Condition } from './condition';
import { QueryExecutorFn } from './db';
import { Table } from './table';
import { getTableData } from './data';
import { ResultSet } from './types';

type ToJoinType<
  JoinType,
  NewJoinType extends 'left-join' | 'left-side-of-right-join' | 'full-join'
> = Extract<JoinType, 'left-side-of-right-join'> extends never ? NewJoinType : JoinType;

// It's important to note that to make sure we infer the table name, we should pass object instead
// of any as the second argument to the table.
type GetTableName<T extends Table<any, any>> = T extends Table<infer A, object> ? A : never;

type AddLeftJoin<Columns, JoinTable> = {
  [K in keyof Columns]: Columns[K] extends Column<
    infer Name,
    infer TableName,
    infer DataType,
    infer IsNotNull,
    infer HasDefault,
    infer JoinType
  >
    ? Extract<GetTableName<JoinTable>, TableName> extends never
      ? Column<Name, TableName, DataType, IsNotNull, HasDefault, JoinType>
      : Column<Name, TableName, DataType, IsNotNull, HasDefault, ToJoinType<JoinType, 'left-join'>>
    : never;
};

type AddRightJoin<Columns, JoinTable> = {
  [K in keyof Columns]: Columns[K] extends Column<
    infer Name,
    infer TableName,
    infer DataType,
    infer IsNotNull,
    infer HasDefault,
    infer JoinType
  >
    ? Extract<GetTableName<JoinTable>, TableName> extends never
      ? Column<
          Name,
          TableName,
          DataType,
          IsNotNull,
          HasDefault,
          ToJoinType<JoinType, 'left-side-of-right-join'>
        >
      : Columns[K]
    : never;
};

type AddFullJoin<Columns> = {
  [K in keyof Columns]: Columns[K] extends Column<
    infer Name,
    infer TableName,
    infer DataType,
    infer IsNotNull,
    infer HasDefault,
    infer JoinType
  >
    ? Column<Name, TableName, DataType, IsNotNull, HasDefault, ToJoinType<JoinType, 'full-join'>>
    : never;
};

type GetSelectableName<S> = S extends Column<infer A2, string, any, boolean, boolean, any>
  ? A2
  : S extends NamedExpression<infer A1, any, boolean>
  ? A1
  : S extends SelectQuery<infer Columns>
  ? keyof Columns // This only works if the query has one select clause
  : never;

type GetSelectable<C extends Selectable> = { [K in GetSelectableName<C>]: C };

// https://www.postgresql.org/docs/12/sql-select.html
export class SelectQuery<Columns extends { [column: string]: Selectable }> {
  private _selectQueryBrand: any;

  constructor(private readonly queryExecutor: QueryExecutorFn, private readonly tokens: Token[]) {}

  then(
    onFulfilled?: ((value: SelectQuery<Columns>) => any | PromiseLike<any>) | undefined | null,
    onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null
  ) {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) => (onFulfilled ? onFulfilled(result.rows) : result))
      .catch(onRejected);
  }

  // [ FROM from_item [, ...] ]
  from<T extends Table<any, any>>(fromItem: T): SelectQuery<Columns> {
    const tableData = getTableData(fromItem);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`FROM`),
      tableData.originalName
        ? new StringToken(`${tableData.originalName} "${tableData.name}"`)
        : new StringToken(tableData.name),
    ]);
  }

  join(table: Table<any, any>): SelectQuery<Columns> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  innerJoin(table: Table<any, any>): SelectQuery<Columns> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`INNER JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  leftOuterJoin<JoinTable extends Table<any, any>>(
    table: JoinTable
  ): SelectQuery<AddLeftJoin<Columns, JoinTable>> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`LEFT OUTER JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  leftJoin<JoinTable extends Table<any, any>>(
    table: JoinTable
  ): SelectQuery<AddLeftJoin<Columns, JoinTable>> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`INNER JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  rightOuterJoin<JoinTable extends Table<any, any>>(
    table: JoinTable
  ): SelectQuery<AddRightJoin<Columns, JoinTable>> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`RIGHT OUTER JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  rightJoin<JoinTable extends Table<any, any>>(
    table: JoinTable
  ): SelectQuery<AddRightJoin<Columns, JoinTable>> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`RIGHT JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  fullOuterJoin<JoinTable extends Table<any, any>>(
    table: JoinTable
  ): SelectQuery<AddFullJoin<Columns>> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`FULL OUTER JOIN`),
      new StringToken(tableData.name),
    ]);
  }
  fullJoin<JoinTable extends Table<any, any>>(table: JoinTable): SelectQuery<AddFullJoin<Columns>> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`FULL JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  // This doesn't go with an ON or USING afterwards
  crossJoin(table: Table<any, any>): SelectQuery<Columns> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`CROSS JOIN`),
      new StringToken(tableData.name),
    ]);
  }

  forUpdate(): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [...this.tokens, new StringToken(`FOR UPDATE`)]);
  }

  forNoKeyUpdate(): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`FOR NO KEY UPDATE`),
    ]);
  }

  forShare(): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [...this.tokens, new StringToken(`FOR SHARE`)]);
  }

  forKeyShare(): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [...this.tokens, new StringToken(`FOR KEY SHARE`)]);
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }

  on(joinCondition: Condition): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`ON`),
      new GroupToken(joinCondition.toTokens()),
    ]);
  }

  using(...columns: Column<any, any, any, any, any, any>[]): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`USING`),
      new GroupToken([
        new SeparatorToken(
          ',',
          columns.map((column) => new CollectionToken(column.toTokens()))
        ),
      ]),
    ]);
  }

  // [ WHERE condition ]
  where(condition: Condition): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`WHERE`),
      ...condition.toTokens(),
    ]);
  }

  // [ GROUP BY grouping_element [, ...] ]
  // ( )
  // expression
  // ( expression [, ...] )
  // ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
  // CUBE ( { expression | ( expression [, ...] ) } [, ...] )
  // GROUPING SETS ( grouping_element [, ...] )
  groupBy(...expressions: Expression<any, any>[]): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`GROUP BY`),
      new SeparatorToken(
        ',',
        expressions.map((expression) => new CollectionToken(expression.toTokens()))
      ),
    ]);
  }

  // [ HAVING condition [, ...] ]
  having(...conditions: Condition[]): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`HAVING`),
      new SeparatorToken(
        `,`,
        conditions.map((condition) => new CollectionToken(condition.toTokens()))
      ),
    ]);
  }

  // [ WINDOW window_name AS ( window_definition ) [, ...] ]
  window(): SelectQuery<Columns> {
    return undefined as any;
  }

  // [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
  // [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
  orderBy(...expressions: Expression<any, any>[]): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`ORDER BY`),
      new SeparatorToken(
        ',',
        expressions.map((expression) => new CollectionToken(expression.toTokens()))
      ),
    ]);
  }

  // [ LIMIT { count | ALL } ]
  limit(limit: number | 'ALL'): SelectQuery<Columns> {
    if (limit === `ALL`) {
      return new SelectQuery(this.queryExecutor, [...this.tokens, new StringToken(`LIMIT ALL`)]);
    } else {
      return new SelectQuery(this.queryExecutor, [
        ...this.tokens,
        new StringToken(`LIMIT`),
        new ParameterToken(limit),
      ]);
    }
  }

  // [ OFFSET start [ ROW | ROWS ] ]
  offset(start: number): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`OFFSET`),
      new ParameterToken(start),
    ]);
  }

  fetch(count: number): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`FETCH FIRST`),
      new ParameterToken(count),
      new StringToken(`ROWS ONLY`),
    ]);
  }

  of(table: Table<any, any>): SelectQuery<Columns> {
    const tableData = getTableData(table);

    return new SelectQuery(this.queryExecutor, [
      ...this.tokens,
      new StringToken(`OF`),
      new StringToken(tableData.name),
    ]);
  }

  nowait(): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [...this.tokens, new StringToken(`NOWAIT`)]);
  }

  skipLocked(): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, [...this.tokens, new StringToken(`SKIP LOCKED`)]);
  }
}

type Selectable =
  | NamedExpression<any, any, any>
  | SelectQuery<any>
  | Column<any, any, any, boolean, boolean, any>;

export interface SelectFn {
  <C1 extends Selectable>(c1: C1): SelectQuery<GetSelectable<C1>>;
  <C1 extends Selectable, C2 extends Selectable>(c1: C1, c2: C2): SelectQuery<
    GetSelectable<C1> & GetSelectable<C2>
  >;
  <C1 extends Selectable, C2 extends Selectable, C3 extends Selectable>(
    c1: C1,
    c2: C2,
    c3: C3
  ): SelectQuery<GetSelectable<C1> & GetSelectable<C2> & GetSelectable<C3>>;
  <C1 extends Selectable, C2 extends Selectable, C3 extends Selectable, C4 extends Selectable>(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4
  ): SelectQuery<GetSelectable<C1> & GetSelectable<C2> & GetSelectable<C3> & GetSelectable<C4>>;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10>
  >;
}

export const makeSelect = (queryExecutor: QueryExecutorFn, initialTokens?: Token[]): SelectFn => <
  T extends Selectable
>(
  ...columns: T[]
) => {
  return new SelectQuery(queryExecutor, [
    ...(initialTokens || []),
    new StringToken(`SELECT`),
    new SeparatorToken(
      `,`,
      columns.map((column) => {
        const tokens = column.toTokens();

        // TODO: this is just in case we select a query e.g. select(foo.id, select(foo.value).from(foo)).from(foo)
        // as the subquery needs a group around it. If this has any weird side effects of adding a
        // group around an expression which is not neccesary or even breaking we should consider
        // letting the group happen in user land instead OR we could start inspecting the tokens but
        // rather not start doing that.
        if (tokens.length > 1) {
          return new GroupToken(tokens);
        }

        return tokens[0];
      })
    ),
  ]);
};
