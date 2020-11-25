import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
  createQueryState,
} from './tokens';
import { SelectFn, Selectable } from './SelectFn';
import { Table, TableDefinition } from './table';

import { Column } from './column';
import { Expression } from './expression';
import { Query } from './query';
import { QueryExecutorFn } from './types';
import { ResultSet } from './result-set';
import { wrapQuotes } from './naming';

export { SelectFn };

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

// https://www.postgresql.org/docs/12/sql-select.html
export class SelectQuery<Columns extends { [column: string]: any }> extends Query<Columns> {
  private _selectQueryBrand: any;

  /** @internal */
  getReturningKeys() {
    return this.returningKeys;
  }

  constructor(
    private readonly queryExecutor: QueryExecutorFn,
    private readonly returningKeys: string[],
    private readonly tokens: Token[],
  ) {
    super();
  }

  then(
    onFulfilled?:
      | ((value: ResultSet<SelectQuery<Columns>, false>[]) => any | PromiseLike<any>)
      | undefined
      | null,
    onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null,
  ) {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) => (onFulfilled ? onFulfilled(result.rows as any) : result))
      .catch(onRejected);
  }

  private newSelectQuery(tokens: Token[]): SelectQuery<Columns> {
    return new SelectQuery(this.queryExecutor, this.returningKeys, tokens);
  }

  // [ FROM from_item [, ...] ]
  from<T extends Table<any, any>>(
    fromItem: T,
  ): T extends TableDefinition<any> ? never : SelectQuery<Columns> {
    const table = fromItem as Table<any, any>;

    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`FROM`),
      this.getTableStringToken(table),
    ]) as any;
  }

  private getTableStringToken(table: Table<any, any>) {
    if (table.getOriginalName()) {
      return new StringToken(
        `${wrapQuotes(table.getOriginalName())} ${wrapQuotes(table.getName())}`,
      );
    }

    return new StringToken(wrapQuotes(table.getName()));
  }

  join(table: Table<any, any>): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  innerJoin(table: Table<any, any>): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`INNER JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  leftOuterJoin<JoinTable extends Table<any, any>>(
    table: JoinTable,
  ): SelectQuery<AddLeftJoin<Columns, JoinTable>> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`LEFT OUTER JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  leftJoin<JoinTable extends Table<any, any>>(
    table: JoinTable,
  ): SelectQuery<AddLeftJoin<Columns, JoinTable>> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`INNER JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  rightOuterJoin<JoinTable extends Table<any, any>>(
    table: JoinTable,
  ): SelectQuery<AddRightJoin<Columns, JoinTable>> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`RIGHT OUTER JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  rightJoin<JoinTable extends Table<any, any>>(
    table: JoinTable,
  ): SelectQuery<AddRightJoin<Columns, JoinTable>> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`RIGHT JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  fullOuterJoin<JoinTable extends Table<any, any>>(
    table: JoinTable,
  ): SelectQuery<AddFullJoin<Columns>> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`FULL OUTER JOIN`),
      this.getTableStringToken(table),
    ]);
  }
  fullJoin<JoinTable extends Table<any, any>>(table: JoinTable): SelectQuery<AddFullJoin<Columns>> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`FULL JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  // This doesn't go with an ON or USING afterwards
  crossJoin(table: Table<any, any>): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`CROSS JOIN`),
      this.getTableStringToken(table),
    ]);
  }

  forUpdate(): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR UPDATE`)]);
  }

  forNoKeyUpdate(): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR NO KEY UPDATE`)]);
  }

  forShare(): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR SHARE`)]);
  }

  forKeyShare(): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR KEY SHARE`)]);
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }

  on(joinCondition: Expression<boolean, boolean, string>): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`ON`),
      new GroupToken(joinCondition.toTokens()),
    ]);
  }

  using(...columns: Column<any, any, any, any, any, any>[]): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`USING`),
      new GroupToken([
        new SeparatorToken(
          ',',
          columns.map((column) => new CollectionToken(column.toTokens())),
        ),
      ]),
    ]);
  }

  // [ WHERE condition ]
  where(condition: Expression<boolean, boolean, string>): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`WHERE`), ...condition.toTokens()]);
  }

  // [ GROUP BY grouping_element [, ...] ]
  // ( )
  // expression
  // ( expression [, ...] )
  // ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
  // CUBE ( { expression | ( expression [, ...] ) } [, ...] )
  // GROUPING SETS ( grouping_element [, ...] )
  groupBy(...expressions: Expression<any, any, any>[]): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`GROUP BY`),
      new SeparatorToken(
        ',',
        expressions.map((expression) => new CollectionToken(expression.toTokens())),
      ),
    ]);
  }

  // [ HAVING condition [, ...] ]
  having(...conditions: Expression<boolean, boolean, string>[]): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`HAVING`),
      new SeparatorToken(
        `,`,
        conditions.map((condition) => new CollectionToken(condition.toTokens())),
      ),
    ]);
  }

  // [ WINDOW window_name AS ( window_definition ) [, ...] ]
  window(): SelectQuery<Columns> {
    return undefined as any;
  }

  // [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
  // [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
  orderBy(...expressions: Expression<any, any, any>[]): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`ORDER BY`),
      new SeparatorToken(
        ',',
        expressions.map((expression) => new CollectionToken(expression.toTokens())),
      ),
    ]);
  }

  // [ LIMIT { count | ALL } ]
  limit(limit: number | 'ALL'): SelectQuery<Columns> {
    if (limit === `ALL`) {
      return this.newSelectQuery([...this.tokens, new StringToken(`LIMIT ALL`)]);
    } else {
      return this.newSelectQuery([
        ...this.tokens,
        new StringToken(`LIMIT`),
        new ParameterToken(limit),
      ]);
    }
  }

  // [ OFFSET start [ ROW | ROWS ] ]
  offset(start: number): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`OFFSET`),
      new ParameterToken(start),
    ]);
  }

  fetch(count: number): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`FETCH FIRST`),
      new ParameterToken(count),
      new StringToken(`ROWS ONLY`),
    ]);
  }

  of(table: Table<any, any>): SelectQuery<Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`OF`),
      new StringToken(table.getName()),
    ]);
  }

  nowait(): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`NOWAIT`)]);
  }

  skipLocked(): SelectQuery<Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`SKIP LOCKED`)]);
  }
}

export const makeSelect = (queryExecutor: QueryExecutorFn, initialTokens?: Token[]): SelectFn => <
  T extends Selectable
>(
  ...columns: T[]
) => {
  const returningKeys = columns.map((column) => {
    if (column instanceof Query) {
      return column.getReturningKeys()[0];
    }
    return (column as any).getName();
  });

  return new SelectQuery(queryExecutor, returningKeys, [
    ...(initialTokens || []),
    new StringToken(`SELECT`),
    new SeparatorToken(
      `,`,
      columns.map((column) => {
        const tokens = column.toTokens(true);

        if (column instanceof Query) {
          return new GroupToken(tokens);
        }

        return new CollectionToken(tokens);
      }),
    ),
  ]);
};
