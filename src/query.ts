import { QueryResult } from 'pg';
import { ColumnWrapper } from '.';
import { Database } from './database';
import { Keyword } from './keywords';
import { TableWrapper } from './table';
import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
} from './tokens';

export interface Tokenable {
  toTokens(): Token[];
}

export interface State {
  text: string[];
  parameters: any[];
}

export interface QueryState {
  text: string;
  parameters: any[];
}

export const createState = (tokens: Token[], numberOfParameters: number): State => {
  const initialState = {
    text: [],
    parameters: [],
  };

  return tokens.reduce(
    (tokenState, token) =>
      token.reduce(tokenState, tokenState.parameters.length + numberOfParameters),
    initialState,
  );
};

export type QueryType = 'COUNT' | 'ROWS';

export interface ColumnMap {
  [snakeCaseName: string]: string;
}

export class Query<Db extends Database<any>, Ret, SingleRet, Tables = undefined> {
  protected tokens: Token[];
  protected db: Db;
  protected type: QueryType;
  protected columnsMap: ColumnMap;

  constructor(db: Db, columnsMap: ColumnMap = {}, ...tokens: Token[]) {
    this.db = db;
    // TODO: this is actually a result set description as it's only used to match the field from
    // the result set to the expected column in the select or returning call.
    this.columnsMap = columnsMap;
    this.type = 'COUNT';
    this.tokens = tokens || [];
  }

  /** @internal */
  toTokens() {
    return this.tokens;
  }

  async first(): Promise<SingleRet | undefined> {
    const ret = await this.exec();

    switch (this.type) {
      case 'COUNT':
        return undefined as any;
      case 'ROWS':
        return (ret as any)[0];
    }
  }

  async map<T>(callback: (obj: SingleRet) => T): Promise<T[]> {
    const ret = await this.exec();

    switch (this.type) {
      case 'COUNT':
        return [];
      case 'ROWS':
        return ((ret as unknown) as SingleRet[]).map(callback);
    }
  }

  async filter(callback: (obj: SingleRet) => boolean): Promise<SingleRet[]> {
    const ret = await this.exec();

    switch (this.type) {
      case 'COUNT':
        return [];
      case 'ROWS':
        return ((ret as unknown) as SingleRet[]).filter(callback);
    }
  }

  protected getRow = (row: { [key: string]: any } | undefined) =>
    row
      ? Object.keys(row).reduce(
          (camelCaseRow, key) => ({
            ...camelCaseRow,
            [this.columnsMap[key]]: row[key],
          }),
          {},
        )
      : undefined;

  protected getRet(result: QueryResult): Ret {
    switch (this.type) {
      case 'COUNT':
        return result.rowCount as any;
      case 'ROWS':
        return result.rows.map(this.getRow) as any;
    }
  }

  /** @internal */
  async exec(): Promise<Ret> {
    const query = this.toQuery();
    const result = await this.db.exec(query.text, query.parameters);

    return this.getRet(result);
  }

  async then(
    onFulfilled?: ((value: Ret) => Ret | PromiseLike<Ret>) | undefined | null,
    onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null,
  ) {
    try {
      const ret = await this.exec();

      if (onFulfilled) {
        return onFulfilled(ret);
      }
    } catch (e) {
      if (onRejected) {
        return onRejected(e);
      }
    }
  }

  /** @internal */
  toQuery(): QueryState {
    const state = createState(this.tokens, 0);

    return {
      text: state.text.join(' '),
      parameters: state.parameters,
    };
  }

  append(strings?: TemplateStringsArray, parameters?: any[]): void {
    if (!strings) {
      return;
    }

    for (let i = 0; i < strings.length; i += 1) {
      const string = strings[i];

      if (string.length > 0) {
        this.tokens.push(new StringToken(string));
      }

      if (parameters && i < parameters.length) {
        const parameter = parameters[i];

        if (parameter instanceof Query) {
          const query = parameter;

          this.tokens.push(...query.tokens);
        } else if (parameter instanceof Token) {
          this.tokens.push(parameter);
        } else if (
          Array.isArray(parameter) &&
          parameter.length > 0 &&
          parameter[0] instanceof Query
        ) {
          // We assume everything in the array is a query now. This is tricky.

          for (let j = 0, jl = parameter.length; j < jl; j++) {
            const subinstance = parameter[j];

            this.tokens.push(...subinstance.tokens);

            if (j + 1 < jl) {
              this.tokens.push(new StringToken(', '));
            }
          }
        } else {
          this.tokens.push(new ParameterToken(parameter));
        }
      }
    }
  }

  protected internalFrom<T extends TableWrapper<any, any, any>>(table: T) {
    this.tokens.push(new StringToken(`FROM`), new StringToken(table.getName()));
    return this;
  }

  protected internalJoin<JoinTable extends TableWrapper<any>, Ret>(
    type:
      | 'JOIN'
      | 'INNER JOIN'
      | 'CROSS JOIN'
      | 'FULL JOIN'
      | 'LEFT JOIN'
      | 'RIGHT JOIN'
      | 'LEFT OUTER JOIN'
      | 'RIGHT OUTER JOIN'
      | 'FULL OUTER JOIN',
    table: JoinTable,
  ) {
    this.tokens.push(new StringToken(type), new StringToken(table.getName()));

    return {
      on: (tokenable: Tokenable): Ret => {
        this.tokens.push(new StringToken(`ON`), new GroupToken(tokenable.toTokens()));
        return this as any;
      },

      using: <T1 extends keyof Tables, T2 extends keyof JoinTable['$row'], C extends T1 & T2>(
        ...columnNames: C[]
      ): Ret => {
        this.tokens.push(
          new StringToken(`USING`),
          new GroupToken(columnNames.map(columnName => new StringToken(columnName as any))),
        );
        return this as any;
      },
    };
  }

  protected internalWhere(tokenable: Tokenable) {
    this.append`WHERE`;
    this.tokens.push(...tokenable.toTokens());
    return this;
  }

  protected internalReturning(...columns: (ColumnWrapper<any, any, any, any, any> | undefined)[]) {
    this.type = 'ROWS';
    this.columnsMap = columns.filter(column => Boolean(column)).reduce(
      (map, column) => ({
        ...map,
        [column!.getSnakeCaseName()]: column!.getCamelCaseName(),
      }),
      {},
    );

    this.tokens.push(
      new StringToken(`RETURNING`),
      new SeparatorToken(
        `,`,
        columns
          .filter(column => Boolean(column))
          .map(column => new CollectionToken(column!.toTokens())),
      ),
    );
    return this as any;
  }
}

export class PartialQuery implements Tokenable {
  tokens: Token[] = [];

  constructor(...tokens: Token[]) {
    this.tokens = tokens || [];
  }

  toTokens() {
    return this.tokens;
  }

  private add(partialQuery: PartialQuery | Query<any, any, any>, separator: string) {
    this.tokens.push(new StringToken(separator), ...partialQuery.toTokens());
    return this;
  }

  or(partialQuery: PartialQuery) {
    return this.add(partialQuery, `OR`);
  }

  and(partialQuery?: PartialQuery) {
    this.tokens.push(new StringToken(`AND`));

    if (partialQuery) {
      this.tokens.push(...partialQuery.toTokens());
    }
    return this;
  }

  andNotExists(partialQuery: PartialQuery | Query<any, any, any>) {
    this.tokens.push(new StringToken(`AND NOT EXISTS`), new GroupToken(partialQuery.toTokens()));
    return this;
  }

  andExists(partialQuery: PartialQuery | Query<any, any, any>) {
    this.tokens.push(new StringToken(`AND EXISTS`), new GroupToken(partialQuery.toTokens()));
    return this;
  }

  minus(string: string) {
    this.tokens.push(new StringToken(`-`), new ParameterToken(string));
    return this;
  }

  plus(string: string) {
    this.tokens.push(new StringToken(`+`), new ParameterToken(string));
    return this;
  }

  gt(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`>`), ...partialQuery.toTokens());
    return this;
  }

  lt(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`<`), ...partialQuery.toTokens());
    return this;
  }

  gte(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`>=`), ...partialQuery.toTokens());
    return this;
  }

  lte(partialQuery: PartialQuery) {
    this.tokens.push(new StringToken(`<=`), ...partialQuery.toTokens());
    return this;
  }

  not(partialQuery?: PartialQuery) {
    this.tokens.push(new StringToken(`NOT`));
    if (partialQuery) {
      this.tokens.push(...partialQuery.toTokens());
    }
    return this;
  }

  in(object: any[] | PartialQuery | Query<any, any, any>) {
    if (object instanceof PartialQuery) {
      this.tokens.push(new StringToken(`IN`), new GroupToken(object.tokens));
    } else if (object instanceof Query) {
      this.tokens.push(new StringToken(`IN`), new GroupToken(object.toTokens()));
    } else {
      this.tokens.push(new StringToken(`IN`), new GroupToken([new ParameterToken(object)]));
    }
    return this;
  }

  // TODO: Move this to an order by query.
  nullsFirst() {
    this.tokens.push(new StringToken(`NULLS FIRST`));
    return this;
  }

  nullsLast() {
    this.tokens.push(new StringToken(`NULLS LAST`));
    return this;
  }
}

export class InsertQuery<
  Db extends Database<any>,
  T extends TableWrapper<Row, InsertRow, UpdateRow>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet
> extends Query<Db, Ret, SingleRet> {
  private table: T;

  constructor(db: Db, table: T, ...tokens: Token[]) {
    super(db, {}, ...tokens);

    this.table = table;
  }

  protected getRet(result: QueryResult): Ret {
    // TODO: we should support an array in InsertQuery#values. Based on the input we determine the output of the insert into.
    switch (this.type) {
      case `COUNT`:
        return result.rowCount as any;
      case `ROWS`:
        return this.getRow(result.rows[0]) as any;
    }
  }

  private getColumn(
    key: string | number | symbol,
  ): ColumnWrapper<any, any, any, any, any> | undefined {
    return (this.table as any)[key];
  }

  defaultValues(): InsertQuery<Db, T, Row, InsertRow, UpdateRow, number, {}> {
    this.tokens.push(new StringToken(`DEFAULT VALUES`));
    return this as any;
  }

  // TODO: the return type of the query, in the object, should only contain a single field and the
  // field name shouldn't matter. Now it may contain multiple fields which is not possible at
  // runtime.
  values(
    object: InsertRow | InsertRow[],
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, number, {}> {
    const objects = Array.isArray(object) ? object : [object];
    const firstObject = objects[0];
    const keys = Object.keys(firstObject).filter(
      key => firstObject[key as keyof InsertRow] !== null,
    );
    if (keys.length === 0) {
      if (objects.length === 1) {
        return this.defaultValues();
      }

      // TODO: insert multiple rows with default values.
      throw new Error(`inserting multiple rows with default values is not possible yet`);
    } else {
      this.tokens.push(
        new GroupToken([
          new SeparatorToken(
            ',',
            keys
              .map(key => this.getColumn(key))
              .filter(column => Boolean(column))
              .map(column => new StringToken(column!.snakeCaseName)),
          ),
        ]),
        new StringToken(`VALUES`),
        new SeparatorToken(
          ',',
          objects.map(
            object =>
              new GroupToken([
                new SeparatorToken(
                  ',',
                  keys.map(key => new ParameterToken(object[key as keyof InsertRow])),
                ),
              ]),
          ),
        ),
      );
    }

    return this as any;
  }

  onConflict(...columnNames: (keyof Row)[]) {
    // TODO: It's also possible to specify ON CONSTRAINT :constraintName.
    this.tokens.push(
      new StringToken(`ON CONFLICT`),
      new GroupToken([
        new SeparatorToken(
          `,`,
          columnNames
            .map(columnName => this.getColumn(columnName))
            .filter(column => Boolean(column))
            .map(column => new StringToken(column!.snakeCaseName)),
        ),
      ]),
    );

    return {
      doNothing: (): InsertQuery<Db, T, Row, InsertRow, UpdateRow, Ret | undefined, SingleRet> => {
        this.tokens.push(new StringToken(`DO NOTHING`));
        return this as any;
      },

      doUpdateSet: (
        object: Partial<
          {
            [K in keyof UpdateRow]:
              | UpdateRow[K]
              | Query<any, any, { [string: string]: UpdateRow[K] }>
          }
        >,
      ): UpsertQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet> => {
        const keys = Object.keys(object);

        const getValueTokens = (value: any) => {
          if (value instanceof Keyword) {
            return new StringToken(value.toSql());
          } else if (value instanceof Query) {
            return new GroupToken(value.toTokens());
          }

          return new ParameterToken(value);
        };

        this.tokens.push(
          new StringToken(`DO UPDATE SET`),
          new SeparatorToken(
            `,`,
            keys
              .map(columnName => this.getColumn(columnName))
              .filter(column => Boolean(column))
              .map(column => {
                const value = (object as any)[column!.camelCaseName];
                return new CollectionToken([
                  new StringToken(column!.snakeCaseName),
                  new StringToken(`=`),
                  getValueTokens(value),
                ]);
              }),
          ),
        );

        return new UpsertQuery(this.db, this.table, ...this.tokens);
      },
    };
  }

  returning<A extends keyof Row, R = { [PA in A]: Row[PA] }>(
    columnNameA: A,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] }
  >(columnNameA: A, columnNameB: B): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] } & { [PC in C]: Row[PC] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    I extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] } &
      { [PI in I]: Row[PI] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
    columnNameI: I,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    I extends keyof Row,
    J extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] } &
      { [PI in I]: Row[PI] } &
      { [PJ in J]: Row[PJ] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
    columnNameI: I,
    columnNameJ: J,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] }
  >(columnA: A): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } & { [PA in B['name']]: B['selectType'] }
  >(columnA: A, columnB: B): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] }
  >(columnA: A, columnB: B, columnC: C): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    R = { [P in A['name']]: A['selectType'] } &
      { [P in B['name']]: B['selectType'] } &
      { [P in C['name']]: C['selectType'] } &
      { [P in D['name']]: D['selectType'] } &
      { [P in E['name']]: E['selectType'] } &
      { [P in F['name']]: F['selectType'] } &
      { [P in G['name']]: G['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    I extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] } &
      { [PA in I['name']]: I['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
    columnI: I,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    I extends ColumnWrapper<any, any, any, any, any>,
    J extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] } &
      { [PA in I['name']]: I['selectType'] } &
      { [PA in J['name']]: J['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
    columnI: I,
    columnJ: J,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning(...columns: (ColumnWrapper<any, any, any, any, any> | keyof Row)[]) {
    return this.internalReturning(
      ...(columns.map(
        columnOrColumnName =>
          typeof columnOrColumnName === `string`
            ? this.getColumn(columnOrColumnName as any)
            : columnOrColumnName,
      ) as ColumnWrapper<any, any, any, any, any>[]),
    );
  }
}

export class UpsertQuery<
  Db extends Database<any>,
  T extends TableWrapper<Row, InsertRow, UpdateRow>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet
> extends InsertQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet> {
  where(tokenable: Tokenable) {
    return this.internalWhere(tokenable);
  }
}

export class SelectQuery<
  Db extends Database<any>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet,
  Tables = undefined
> extends Query<Db, Ret, SingleRet, Tables> {
  protected type: QueryType = 'ROWS';

  /** @internal */
  from<T extends TableWrapper<any, any, any>>(
    table: T,
  ): SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables & T['$row']> {
    // TODO: move this to the constructor so we do not have to expose SelectQuery#from().

    return this.internalFrom(table);
  }

  join<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'JOIN',
      table,
    );
  }

  crossJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'CROSS JOIN',
      table,
    );
  }

  innerJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'INNER JOIN',
      table,
    );
  }

  leftJoin<T extends TableWrapper<any>>(table: T) {
    // TODO: this isn't rock solid yet. It's changing the return type of the columns selected from the
    // left joined table to be undefined (as that's how it supposed to be). But, we're targeting the
    // columns based on the name, so a collision is likely and column#as() is not supported as it doesn't
    // change the return type.
    return this.internalJoin<
      T,
      SelectQuery<
        Db,
        Row,
        InsertRow,
        UpdateRow,
        // @ts-ignore
        (Pick<Ret[number], Exclude<keyof Ret[number], keyof T['$row']>> &
          Pick<
            { [P in keyof T['$row']]?: T['$row'][P] },
            // @ts-ignore
            Extract<keyof Ret[number], keyof T['$row']>
          >)[],
        Pick<SingleRet, Exclude<keyof SingleRet, keyof T['$row']>> &
          Pick<
            { [P in keyof T['$row']]?: T['$row'][P] },
            Extract<keyof SingleRet, keyof T['$row']>
          >,
        Tables
      >
    >('LEFT JOIN', table);
  }

  rightJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'RIGHT JOIN',
      table,
    );
  }

  leftOuterJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'LEFT OUTER JOIN',
      table,
    );
  }

  rightOuterJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'RIGHT OUTER JOIN',
      table,
    );
  }

  fulllOuterJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'FULL OUTER JOIN',
      table,
    );
  }

  fullJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'FULL JOIN',
      table,
    );
  }

  where(tokenable: Tokenable) {
    return this.internalWhere(tokenable);
  }

  limit(limit: number | 'ALL') {
    this.append`LIMIT`;

    if (typeof limit === 'number') {
      this.tokens.push(new StringToken(String(limit)));
    } else {
      this.tokens.push(new StringToken(`ALL`));
    }

    return this;
  }

  offset(offset: number) {
    this.tokens.push(new StringToken(`OFFSET ${offset}`));
    return this;
  }

  having(tokenable: Tokenable) {
    // TODO: should tokenable be a list like in orderBy?

    this.tokens.push(new StringToken(`HAVING`), ...tokenable.toTokens());
    return this;
  }

  orderBy(...tokenables: Tokenable[]) {
    this.tokens.push(
      new StringToken(`ORDER BY`),
      new SeparatorToken(
        `,`,
        tokenables.map(tokenable => new CollectionToken(tokenable.toTokens())),
      ),
    );
    return this;
  }

  forUpdate() {
    this.tokens.push(new StringToken(`FOR UPDATE`));
    return this;
  }

  skipLocked() {
    this.tokens.push(new StringToken(`SKIP LOCKED`));
    return this;
  }

  groupBy(...columns: ColumnWrapper<any, any, any, any, any>[]) {
    this.tokens.push(
      new StringToken(`GROUP BY`),
      new SeparatorToken(`,`, columns.map(column => new CollectionToken(column!.toTokens()))),
    );
    return this;
  }
}

export class UpdateQuery<
  Db extends Database<any>,
  T extends TableWrapper<Row, InsertRow, UpdateRow>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet,
  Tables = undefined
> extends Query<Db, Ret, SingleRet, Tables> {
  private table: T;

  constructor(db: Db, table: T, ...tokens: Token[]) {
    super(db, {}, ...tokens);

    this.table = table;
  }

  private getColumn(key: string): ColumnWrapper<any, any, any, any, any> | undefined {
    return (this.table as any)[key];
  }

  from<Table extends TableWrapper<any, any, any>>(
    table: Table,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables & Table['$row']> {
    return this.internalFrom(table);
  }

  join<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'JOIN',
      table,
    );
  }

  crossJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'CROSS JOIN',
      table,
    );
  }

  innerJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'INNER JOIN',
      table,
    );
  }

  leftJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'LEFT JOIN',
      table,
    );
  }

  rightJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'RIGHT JOIN',
      table,
    );
  }

  leftOuterJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'LEFT OUTER JOIN',
      table,
    );
  }

  rightOuterJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'RIGHT OUTER JOIN',
      table,
    );
  }

  fulllOuterJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'FULL OUTER JOIN',
      table,
    );
  }

  fullJoin<T extends TableWrapper<any>>(table: T) {
    return this.internalJoin<T, UpdateQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet>>(
      'FULL JOIN',
      table,
    );
  }

  where(tokenable: Tokenable) {
    return this.internalWhere(tokenable);
  }

  returning<A extends keyof Row, R = { [PA in A]: Row[PA] }>(
    columnNameA: A,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] }
  >(columnNameA: A, columnNameB: B): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] } & { [PC in C]: Row[PC] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    I extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] } &
      { [PI in I]: Row[PI] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
    columnNameI: I,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    I extends keyof Row,
    J extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] } &
      { [PI in I]: Row[PI] } &
      { [PJ in J]: Row[PJ] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
    columnNameI: I,
    columnNameJ: J,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] }
  >(columnA: A): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } & { [PA in B['name']]: B['selectType'] }
  >(columnA: A, columnB: B): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] }
  >(columnA: A, columnB: B, columnC: C): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    R = { [P in A['name']]: A['selectType'] } &
      { [P in B['name']]: B['selectType'] } &
      { [P in C['name']]: C['selectType'] } &
      { [P in D['name']]: D['selectType'] } &
      { [P in E['name']]: E['selectType'] } &
      { [P in F['name']]: F['selectType'] } &
      { [P in G['name']]: G['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    I extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] } &
      { [PA in I['name']]: I['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
    columnI: I,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    I extends ColumnWrapper<any, any, any, any, any>,
    J extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] } &
      { [PA in I['name']]: I['selectType'] } &
      { [PA in J['name']]: J['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
    columnI: I,
    columnJ: J,
  ): UpdateQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning(...columns: (ColumnWrapper<any, any, any, any, any> | keyof Row)[]) {
    return this.internalReturning(
      ...(columns.map(
        columnOrColumnName =>
          typeof columnOrColumnName === `string`
            ? this.getColumn(columnOrColumnName as any)
            : columnOrColumnName,
      ) as ColumnWrapper<any, any, any, any, any>[]),
    );
  }
}

export class DeleteQuery<
  Db extends Database<any>,
  T extends TableWrapper<Row, InsertRow, UpdateRow>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet
> extends Query<Db, Ret, SingleRet> {
  private table: T;

  constructor(db: Db, table: T, ...tokens: Token[]) {
    super(db, {}, ...tokens);

    this.table = table;
  }

  private getColumn(key: string): ColumnWrapper<any, any, any, any, any> | undefined {
    return (this.table as any)[key];
  }

  where(tokenable: Tokenable) {
    return this.internalWhere(tokenable);
  }

  returning<A extends keyof Row, R = { [PA in A]: Row[PA] }>(
    columnNameA: A,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] }
  >(columnNameA: A, columnNameB: B): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] } & { [PC in C]: Row[PC] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    I extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] } &
      { [PI in I]: Row[PI] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
    columnNameI: I,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    D extends keyof Row,
    E extends keyof Row,
    F extends keyof Row,
    G extends keyof Row,
    H extends keyof Row,
    I extends keyof Row,
    J extends keyof Row,
    R = { [PA in A]: Row[PA] } &
      { [PB in B]: Row[PB] } &
      { [PC in C]: Row[PC] } &
      { [PD in D]: Row[PD] } &
      { [PE in E]: Row[PE] } &
      { [PF in F]: Row[PF] } &
      { [PG in G]: Row[PG] } &
      { [PH in H]: Row[PH] } &
      { [PI in I]: Row[PI] } &
      { [PJ in J]: Row[PJ] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
    columnNameD: D,
    columnNameE: E,
    columnNameF: F,
    columnNameG: G,
    columnNameH: H,
    columnNameI: I,
    columnNameJ: J,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] }
  >(columnA: A): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } & { [PA in B['name']]: B['selectType'] }
  >(columnA: A, columnB: B): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] }
  >(columnA: A, columnB: B, columnC: C): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    R = { [P in A['name']]: A['selectType'] } &
      { [P in B['name']]: B['selectType'] } &
      { [P in C['name']]: C['selectType'] } &
      { [P in D['name']]: D['selectType'] } &
      { [P in E['name']]: E['selectType'] } &
      { [P in F['name']]: F['selectType'] } &
      { [P in G['name']]: G['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    I extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] } &
      { [PA in I['name']]: I['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
    columnI: I,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    E extends ColumnWrapper<any, any, any, any, any>,
    F extends ColumnWrapper<any, any, any, any, any>,
    G extends ColumnWrapper<any, any, any, any, any>,
    H extends ColumnWrapper<any, any, any, any, any>,
    I extends ColumnWrapper<any, any, any, any, any>,
    J extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] } &
      { [PA in D['name']]: D['selectType'] } &
      { [PA in E['name']]: E['selectType'] } &
      { [PA in F['name']]: F['selectType'] } &
      { [PA in G['name']]: G['selectType'] } &
      { [PA in H['name']]: H['selectType'] } &
      { [PA in I['name']]: I['selectType'] } &
      { [PA in J['name']]: J['selectType'] }
  >(
    columnA: A,
    columnB: B,
    columnC: C,
    columnD: D,
    columnE: E,
    columnF: F,
    columnG: G,
    columnH: H,
    columnI: I,
    columnJ: J,
  ): DeleteQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning(...columns: (ColumnWrapper<any, any, any, any, any> | keyof Row)[]) {
    return this.internalReturning(
      ...(columns.map(
        columnOrColumnName =>
          typeof columnOrColumnName === `string`
            ? this.getColumn(columnOrColumnName as any)
            : columnOrColumnName,
      ) as ColumnWrapper<any, any, any, any, any>[]),
    );
  }
}
