import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  TableToken,
  Token,
  createQueryState,
} from './tokens';
import { SelectFn, Selectable } from './SelectFn';

import { AnyColumn, Column } from './column';
import { DbConfig } from './config';
import { AnyExpression, Expression } from './expression';
import { FromItem } from './with';
import { Query } from './query';
import { QueryExecutorFn } from './types';
import { ResultSet } from './result-set';
import { Star } from './sql-functions';
import { AnyTable, Table } from './TableType';
import { TableDefinition } from './table';

export { SelectFn };

type JoinType = 'left-join' | 'left-side-of-right-join' | 'full-join';
type ToJoinType<OldType, NewType extends JoinType> = Extract<
  OldType,
  'left-side-of-right-join'
> extends never
  ? NewType
  : OldType;

// It's important to note that to make sure we infer the table name, we should pass object instead
// of any as the second argument to the table.
type GetTableName<T extends AnyTable> = T extends Table<any, infer A, object> ? A : never;

type AddLeftJoin<Columns, JoinTable> = {
  [K in keyof Columns]: Columns[K] extends Column<
    infer Config,
    infer Name,
    infer TableName,
    infer DataType,
    infer IsNotNull,
    infer HasDefault,
    infer JoinType
  >
    ? Extract<GetTableName<JoinTable>, TableName> extends never
      ? Column<Config, Name, TableName, DataType, IsNotNull, HasDefault, JoinType>
      : Column<
          Config,
          Name,
          TableName,
          DataType,
          IsNotNull,
          HasDefault,
          ToJoinType<JoinType, 'left-join'>
        >
    : never;
};

type AddRightJoin<Columns, JoinTable> = {
  [K in keyof Columns]: Columns[K] extends Column<
    infer Config,
    infer Name,
    infer TableName,
    infer DataType,
    infer IsNotNull,
    infer HasDefault,
    infer JoinType
  >
    ? Extract<GetTableName<JoinTable>, TableName> extends never
      ? Column<
          Config,
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

type AddJoinType<Columns, NewJoinType extends JoinType> = {
  [K in keyof Columns]: Columns[K] extends Column<
    infer Config,
    infer Name,
    infer TableName,
    infer DataType,
    infer IsNotNull,
    infer HasDefault,
    infer OldJoinType
  >
    ? Column<
        Config,
        Name,
        TableName,
        DataType,
        IsNotNull,
        HasDefault,
        ToJoinType<OldJoinType, NewJoinType>
      >
    : never;
};

type Join<
  Query extends SelectQuery<any, any, boolean>,
  JoinTable extends AnyTable | FromItem<any, any>,
> = Query extends SelectQuery<infer Config, infer ExistingColumns, infer IncludesStar>
  ? IncludesStar extends true
    ? SelectQuery<
        Config,
        ExistingColumns & Omit<GetColumns<JoinTable>, keyof ExistingColumns>,
        true
      >
    : SelectQuery<Config, ExistingColumns, false>
  : never;

type GetColumns<From extends AnyTable | FromItem<any, any>> = From extends Table<
  any,
  any,
  infer Columns
>
  ? Columns
  : From extends FromItem<any, infer Q>
  ? Q extends Query<infer Returning>
    ? Returning
    : never
  : never;

type LeftJoin<
  Query extends SelectQuery<any, any>,
  JoinTable extends AnyTable | FromItem<any, any>,
> = Query extends SelectQuery<infer Config, infer ExistingColumns, infer IncludesStar>
  ? IncludesStar extends true
    ? SelectQuery<Config, ExistingColumns & AddJoinType<GetColumns<JoinTable>, 'left-join'>>
    : SelectQuery<Config, AddLeftJoin<ExistingColumns, JoinTable>>
  : never;

type RightJoin<
  Query extends SelectQuery<any, any>,
  JoinTable extends AnyTable | FromItem<any, any>,
> = Query extends SelectQuery<infer Config, infer ExistingColumns, infer IncludesStar>
  ? IncludesStar extends true
    ? SelectQuery<
        Config,
        AddJoinType<ExistingColumns, 'left-side-of-right-join'> & GetColumns<JoinTable>
      >
    : SelectQuery<Config, AddRightJoin<ExistingColumns, JoinTable>>
  : never;

type FullJoin<
  Query extends SelectQuery<any, any>,
  JoinTable extends AnyTable | FromItem<any, any>,
> = Query extends SelectQuery<infer Config, infer ExistingColumns, infer IncludesStar>
  ? IncludesStar extends true
    ? SelectQuery<Config, AddJoinType<ExistingColumns & GetColumns<JoinTable>, 'full-join'>>
    : SelectQuery<Config, AddJoinType<ExistingColumns, 'full-join'>>
  : never;

// https://www.postgresql.org/docs/12/sql-select.html
export class SelectQuery<
  Config extends DbConfig,
  Columns extends { [column: string]: any },
  IncludesStar = false,
> extends Query<Columns> {
  private _selectQueryBrand: any;

  /** @internal */
  getReturningKeys() {
    return this.returningKeys;
  }

  constructor(
    private readonly queryExecutor: QueryExecutorFn,
    private readonly returningKeys: string[],
    private readonly includesStar: boolean,
    private readonly tokens: Token[],
  ) {
    super();
  }

  async exec() {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters);
  }

  then<Result1, Result2 = never>(
    onFulfilled?:
      | ((
          value: ResultSet<Config, SelectQuery<Config, Columns>, false>[],
        ) => Result1 | PromiseLike<Result1>)
      | undefined
      | null,
    onRejected?: ((reason: any) => Result2 | PromiseLike<Result2>) | undefined | null,
  ): Promise<Result1 | Result2> {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) => (onFulfilled ? onFulfilled(result.rows as any) : result))
      .catch(onRejected) as any;
  }

  private newSelectQuery(tokens: Token[], table?: AnyTable): SelectQuery<Config, Columns> {
    const returningKeys =
      this.includesStar && table
        ? [
            ...this.returningKeys,
            ...Object.keys(table).filter(
              (name) => ![`as`, `getName`, `getOriginalName`].includes(name),
            ),
          ]
        : this.returningKeys;

    return new SelectQuery(this.queryExecutor, returningKeys, this.includesStar, tokens);
  }

  // [ FROM from_item [, ...] ]
  from<T extends AnyTable>(
    fromItem: T,
  ): T extends TableDefinition<any> ? never : Join<SelectQuery<Config, Columns, IncludesStar>, T> {
    const table = fromItem as AnyTable;

    return this.newSelectQuery(
      [...this.tokens, new StringToken(`FROM`), new TableToken(table)],
      table,
    ) as any;
  }

  join<T extends AnyTable>(table: T): Join<SelectQuery<Config, Columns, IncludesStar>, T> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  innerJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): Join<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`INNER JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  leftOuterJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): LeftJoin<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`LEFT OUTER JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  leftJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): LeftJoin<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`LEFT JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  rightOuterJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): RightJoin<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`RIGHT OUTER JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  rightJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): RightJoin<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`RIGHT JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  fullOuterJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): FullJoin<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`FULL OUTER JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  fullJoin<JoinTable extends AnyTable>(
    table: JoinTable,
  ): FullJoin<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`FULL JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  // This doesn't go with an ON or USING afterwards
  crossJoin<JoinTable extends AnyTable>(
    table: AnyTable,
  ): Join<SelectQuery<Config, Columns, IncludesStar>, JoinTable> {
    return this.newSelectQuery(
      [...this.tokens, new StringToken(`CROSS JOIN`), new TableToken(table)],
      table,
    ) as any;
  }

  forUpdate(): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR UPDATE`)]);
  }

  forNoKeyUpdate(): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR NO KEY UPDATE`)]);
  }

  forShare(): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR SHARE`)]);
  }

  forKeyShare(): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`FOR KEY SHARE`)]);
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }

  on(
    joinCondition: Expression<Config, boolean, boolean, string>,
  ): SelectQuery<Config, Columns, IncludesStar> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`ON`),
      new GroupToken(joinCondition.toTokens()),
    ]) as any;
  }

  using(...columns: AnyColumn[]): SelectQuery<Config, Columns> {
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
  where(condition: Expression<Config, boolean, boolean, string>): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`WHERE`), ...condition.toTokens()]);
  }

  // [ GROUP BY grouping_element [, ...] ]
  // ( )
  // expression
  // ( expression [, ...] )
  // ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
  // CUBE ( { expression | ( expression [, ...] ) } [, ...] )
  // GROUPING SETS ( grouping_element [, ...] )
  groupBy(...expressions: AnyExpression[]): SelectQuery<Config, Columns> {
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
  having(
    ...conditions: Expression<Config, boolean, boolean, string>[]
  ): SelectQuery<Config, Columns> {
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
  window(): SelectQuery<Config, Columns> {
    return undefined as any;
  }

  // [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
  // [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
  orderBy(...expressions: AnyExpression[]): SelectQuery<Config, Columns> {
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
  limit(limit: number | 'ALL'): SelectQuery<Config, Columns> {
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
  offset(start: number): SelectQuery<Config, Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`OFFSET`),
      new ParameterToken(start),
    ]);
  }

  fetch(count: number): SelectQuery<Config, Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`FETCH FIRST`),
      new ParameterToken(count),
      new StringToken(`ROWS ONLY`),
    ]);
  }

  of(table: AnyTable): SelectQuery<Config, Columns> {
    return this.newSelectQuery([
      ...this.tokens,
      new StringToken(`OF`),
      new StringToken(table.getName()),
    ]);
  }

  nowait(): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`NOWAIT`)]);
  }

  skipLocked(): SelectQuery<Config, Columns> {
    return this.newSelectQuery([...this.tokens, new StringToken(`SKIP LOCKED`)]);
  }

  union(query: Query<any>): SelectQuery<Config, Columns, IncludesStar> {
    return this.newSelectQuery([...this.tokens, new StringToken(`UNION`), ...query.toTokens()]);
  }

  unionAll(query: Query<any>): SelectQuery<Config, Columns, IncludesStar> {
    return this.newSelectQuery([...this.tokens, new StringToken(`UNION ALL`), ...query.toTokens()]);
  }
}

export const makeSelect =
  <Config extends DbConfig>(
    queryExecutor: QueryExecutorFn,
    initialTokens?: Token[],
  ): SelectFn<Config> =>
  <T extends Selectable>(...columns: T[]) => {
    const includesStar = !!columns.find((column) => column instanceof Star);

    const returningKeys = columns
      .filter((column) => !(column instanceof Star))
      .map((column) => {
        if (column instanceof Query) {
          return column.getReturningKeys()[0];
        }

        if (!column) {
          throw new Error(`Column '${column}' not found in columns '${columns}'`);
        }

        return (column as any).getName();
      });

    return new SelectQuery(queryExecutor, returningKeys, includesStar, [
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
    ]) as any;
  };
