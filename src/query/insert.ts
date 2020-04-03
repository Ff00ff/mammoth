import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
} from '../tokens';
import { Query, Tokenable } from './base';

import { ColumnWrapper } from '../columns';
import { Database } from '../database';
import { Keyword } from '../keywords';
import { PartialQuery } from './partial';
import { QueryResult } from '../database/backend';
import { SelectQuery } from './select';
import { Table } from '../table';
import { toType } from '../types';

export class InsertQuery<
  Db extends Database<any>,
  T extends Table<Row, InsertRow, UpdateRow>,
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
    switch (this.type) {
      case `COUNT`:
        return result.count as any;
      case `ROWS`:
        return this.getRow(result.rows[0]) as any;
    }
  }

  protected getColumn(
    key: string | number | symbol,
  ): ColumnWrapper<any, any, any, any, any> | undefined {
    return (this.table as any)[key];
  }

  // TODO: the return type of the query, in the object, should only contain a single field and the
  // field name shouldn't matter. Now it may contain multiple fields which is not possible at
  // runtime.
  values(object: InsertRow): InsertQuery<Db, T, Row, InsertRow, UpdateRow, number, {}>;
  values(object: InsertRow[]): MultiInsertQuery<Db, T, Row, InsertRow, UpdateRow, number, {}>;
  values(
    object: InsertRow | InsertRow[],
  ):
    | InsertQuery<Db, T, Row, InsertRow, UpdateRow, number, {}>
    | MultiInsertQuery<Db, T, Row, InsertRow, UpdateRow, number, {}> {
    const objects = Array.isArray(object) ? object : [object];
    const firstObject = objects[0];
    const keys = Object.keys(firstObject).filter(
      key => firstObject[key as keyof InsertRow] !== null,
    );
    if (keys.length === 0) {
      if (objects.length > 1) {
        throw new Error(`Cannot insert multiple rows with only default values`);
      }

      this.tokens.push(new StringToken(`DEFAULT VALUES`));
      return this as any;
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
                  keys.flatMap(key => {
                    const val = object[key as keyof InsertRow];
                    if (val instanceof Keyword) {
                      return val.toTokens();
                    }

                    return [new ParameterToken(val)];
                  }),
                ),
              ]),
          ),
        ),
      );
    }

    if (objects.length > 1) {
      return new MultiInsertQuery(this.db, this.table, ...this.tokens);
    }

    return this as any;
  }

  onConflict(...columnNamesOrConstraintNames: (keyof Row | string)[]) {
    // TODO: It's also possible to specify ON CONSTRAINT :constraintName.
    this.tokens.push(
      new StringToken(`ON CONFLICT`),
      new GroupToken([
        new SeparatorToken(
          `,`,
          columnNamesOrConstraintNames.map(columnNameOrConstraintName => {
            const column = this.getColumn(columnNameOrConstraintName);
            if (column) {
              return new StringToken(column.snakeCaseName);
            } else {
              return new StringToken(columnNameOrConstraintName as string);
            }
          }),
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
            [K in keyof InsertRow]:
              | InsertRow[K]
              | PartialQuery
              | SelectQuery<
                  any,
                  any,
                  any,
                  any,
                  ({ [string: string]: InsertRow[K] | undefined } | undefined)[],
                  { [string: string]: InsertRow[K] | undefined } | undefined
                >
              | undefined;
          }
        >,
      ): UpsertQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet> => {
        const keys = Object.keys(object);

        const getValueTokens = (value: any) => {
          if (value instanceof Keyword) {
            return value.toTokens();
          } else if (value instanceof Query) {
            return [new GroupToken(value.toTokens())];
          } else if (value instanceof PartialQuery) {
            return value.toTokens();
          }

          return [new ParameterToken(value)];
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
                  ...getValueTokens(value),
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
    R = { [PA in A['name']]: toType<A['selectType']> }
  >(columnA: A): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> }
  >(columnA: A, columnB: B): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> }
  >(columnA: A, columnB: B, columnC: C): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R, R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    D extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> } &
      { [PA in D['name']]: toType<D['selectType']> }
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
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> } &
      { [PA in D['name']]: toType<D['selectType']> } &
      { [PA in E['name']]: toType<E['selectType']> }
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
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> } &
      { [PA in D['name']]: toType<D['selectType']> } &
      { [PA in E['name']]: toType<E['selectType']> } &
      { [PA in F['name']]: toType<F['selectType']> }
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
    R = { [P in A['name']]: toType<A['selectType']> } &
      { [P in B['name']]: toType<B['selectType']> } &
      { [P in C['name']]: toType<C['selectType']> } &
      { [P in D['name']]: toType<D['selectType']> } &
      { [P in E['name']]: toType<E['selectType']> } &
      { [P in F['name']]: toType<F['selectType']> } &
      { [P in G['name']]: toType<G['selectType']> }
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
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> } &
      { [PA in D['name']]: toType<D['selectType']> } &
      { [PA in E['name']]: toType<E['selectType']> } &
      { [PA in F['name']]: toType<F['selectType']> } &
      { [PA in G['name']]: toType<G['selectType']> } &
      { [PA in H['name']]: toType<H['selectType']> }
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
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> } &
      { [PA in D['name']]: toType<D['selectType']> } &
      { [PA in E['name']]: toType<E['selectType']> } &
      { [PA in F['name']]: toType<F['selectType']> } &
      { [PA in G['name']]: toType<G['selectType']> } &
      { [PA in H['name']]: toType<H['selectType']> } &
      { [PA in I['name']]: toType<I['selectType']> }
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
    R = { [PA in A['name']]: toType<A['selectType']> } &
      { [PA in B['name']]: toType<B['selectType']> } &
      { [PA in C['name']]: toType<C['selectType']> } &
      { [PA in D['name']]: toType<D['selectType']> } &
      { [PA in E['name']]: toType<E['selectType']> } &
      { [PA in F['name']]: toType<F['selectType']> } &
      { [PA in G['name']]: toType<G['selectType']> } &
      { [PA in H['name']]: toType<H['selectType']> } &
      { [PA in I['name']]: toType<I['selectType']> } &
      { [PA in J['name']]: toType<J['selectType']> }
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
      ...(columns.map(columnOrColumnName =>
        typeof columnOrColumnName === `string`
          ? this.getColumn(columnOrColumnName as any)
          : columnOrColumnName,
      ) as ColumnWrapper<any, any, any, any, any>[]),
    );
  }
}

export class MultiInsertQuery<
  Db extends Database<any>,
  T extends Table<Row, InsertRow, UpdateRow>,
  Row,
  InsertRow,
  UpdateRow,
  Ret,
  SingleRet
> extends InsertQuery<Db, T, Row, InsertRow, UpdateRow, Ret, SingleRet> {
  protected getRet(result: QueryResult): Ret {
    switch (this.type) {
      case `COUNT`:
        return result.count as any;
      case `ROWS`:
        return result.rows.map(this.getRow) as any;
    }
  }

  returning<A extends keyof Row, R = { [PA in A]: Row[PA] }>(
    columnNameA: A,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] }
  >(columnNameA: A, columnNameB: B): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends keyof Row,
    B extends keyof Row,
    C extends keyof Row,
    R = { [PA in A]: Row[PA] } & { [PB in B]: Row[PB] } & { [PC in C]: Row[PC] }
  >(
    columnNameA: A,
    columnNameB: B,
    columnNameC: C,
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] }
  >(columnA: A): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } & { [PA in B['name']]: B['selectType'] }
  >(columnA: A, columnB: B): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning<
    A extends ColumnWrapper<any, any, any, any, any>,
    B extends ColumnWrapper<any, any, any, any, any>,
    C extends ColumnWrapper<any, any, any, any, any>,
    R = { [PA in A['name']]: A['selectType'] } &
      { [PA in B['name']]: B['selectType'] } &
      { [PA in C['name']]: C['selectType'] }
  >(columnA: A, columnB: B, columnC: C): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
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
  ): InsertQuery<Db, T, Row, InsertRow, UpdateRow, R[], R>;
  returning(...columns: (ColumnWrapper<any, any, any, any, any> | keyof Row)[]) {
    return this.internalReturning(
      ...(columns.map(columnOrColumnName =>
        typeof columnOrColumnName === `string`
          ? this.getColumn(columnOrColumnName as any)
          : columnOrColumnName,
      ) as ColumnWrapper<any, any, any, any, any>[]),
    );
  }
}

export class UpsertQuery<
  Db extends Database<any>,
  T extends Table<Row, InsertRow, UpdateRow>,
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
