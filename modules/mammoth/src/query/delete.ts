import { ColumnWrapper } from '../columns';
import { Database } from '../database';
import { Table } from '../table';
import { Token } from '../tokens';
import { Tokenable, Query } from './base';

export class DeleteQuery<
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
      ...(columns.map(columnOrColumnName =>
        typeof columnOrColumnName === `string`
          ? this.getColumn(columnOrColumnName as any)
          : columnOrColumnName,
      ) as ColumnWrapper<any, any, any, any, any>[]),
    );
  }
}
