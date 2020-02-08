import {
  StringToken,
  Token,
  ParameterToken,
  GroupToken,
  CollectionToken,
  SeparatorToken,
} from '../tokens';
import { Table } from '../table';
import { Database } from '../database';
import { ColumnWrapper } from '../columns';
import { QueryResult } from '../database/backend';

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

export const createState = (tokens: Token[], currentParameterIndex: number): State => {
  const initialState = {
    text: [],
    parameters: [],
  };

  return tokens.reduce(
    (tokenState, token) =>
      token.reduce(tokenState, tokenState.parameters.length + currentParameterIndex),
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

  // TODO: fix this return type. It should really be undefined as well if
  first(): Promise<undefined> | Promise<SingleRet> {
    return this.exec().then(ret => {
      switch (this.type) {
        case 'COUNT':
          return undefined;

        case 'ROWS':
          return (ret as any)[0] as SingleRet | undefined;
      }
    }) as any;
  }

  async map<T>(callback: (obj: Exclude<SingleRet, undefined>) => T): Promise<T[]> {
    const ret = await this.exec();

    switch (this.type) {
      case 'COUNT':
        return [];
      case 'ROWS':
        return ((ret as unknown) as Exclude<SingleRet, undefined>[]).map(callback);
    }
  }

  async filter<T = Exclude<SingleRet, undefined>>(callback: (obj: T) => boolean): Promise<T[]> {
    const ret = await this.exec();

    switch (this.type) {
      case 'COUNT':
        return [];
      case 'ROWS':
        return ((ret as unknown) as T[]).filter(callback);
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
        return result.count as any;
      case 'ROWS':
        return result.rows.map(this.getRow) as any;
    }
  }

  /** @internal */
  async exec(): Promise<Ret> {
    const query = this.toQuery();
    console.log(query);
    const result = await this.db.exec(query.text, query.parameters);

    console.log(result);

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

  protected internalFrom<T extends Table<any, any, any>>(table: T) {
    this.tokens.push(new StringToken(`FROM`), new StringToken(table.getName()));
    return this;
  }

  protected internalJoin<JoinTable extends Table<any>, Ret>(
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
    this.columnsMap = columns
      .filter(column => Boolean(column))
      .reduce(
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
