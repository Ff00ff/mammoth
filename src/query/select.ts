import { CollectionToken, GroupToken, SeparatorToken, StringToken } from '../tokens';
import { Query, QueryType, Tokenable } from './base';

import { AliasedColumnWrapper } from './../columns';
import { ColumnWrapper } from '../columns';
import { Database } from '../database';
import { Table } from '../table';

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

  as<T extends string>(name: T) {
    return new AliasedColumnWrapper<
      T,
      unknown,
      SingleRet extends { [_ in keyof SingleRet]: infer U } ? U : never,
      unknown,
      unknown
    >(name, [new GroupToken(this.tokens)], undefined as any, undefined as any, name, name);
  }

  /** @internal */
  from<T extends Table<any, any, any>>(
    table: T,
  ): SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables & T['$row']> {
    // TODO: move this to the constructor so we do not have to expose SelectQuery#from().

    return this.internalFrom(table);
  }

  join<T extends Table<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'JOIN',
      table,
    );
  }

  crossJoin<T extends Table<any>>(table: T) {
    this.tokens.push(new StringToken(`CROSS JOIN`), new StringToken(table.getName()));
    return this;
  }

  innerJoin<T extends Table<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'INNER JOIN',
      table,
    );
  }

  leftJoin<T extends Table<any>>(table: T) {
    return this.internalJoin<
      T,
      SelectQuery<
        Db,
        Row,
        InsertRow,
        UpdateRow,
        // TODO: we should change the return type to optional.
        Ret,
        SingleRet,
        // (Pick<Ret[number], Exclude<keyof Ret[number], keyof T['$row']>> &
        //   Pick<
        //     { [P in keyof T['$row']]?: T['$row'][P] },
        //     Extract<keyof Ret[number], keyof T['$row']>
        //   >)[],
        // Pick<SingleRet, Exclude<keyof SingleRet, keyof T['$row']>> &
        //   Pick<
        //     { [P in keyof T['$row']]?: T['$row'][P] },
        //     Extract<keyof SingleRet, keyof T['$row']>
        //   >,
        Tables
      >
    >('LEFT JOIN', table);
  }

  rightJoin<T extends Table<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'RIGHT JOIN',
      table,
    );
  }

  leftOuterJoin<T extends Table<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'LEFT OUTER JOIN',
      table,
    );
  }

  rightOuterJoin<T extends Table<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'RIGHT OUTER JOIN',
      table,
    );
  }

  fullOuterJoin<T extends Table<any>>(table: T) {
    return this.internalJoin<T, SelectQuery<Db, Row, InsertRow, UpdateRow, Ret, SingleRet, Tables>>(
      'FULL OUTER JOIN',
      table,
    );
  }

  fullJoin<T extends Table<any>>(table: T) {
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

  forNoKeyUpdate() {
    this.tokens.push(new StringToken(`FOR UPDATE`));
    return this;
  }

  forShare() {
    this.tokens.push(new StringToken(`FOR UPDATE`));
    return this;
  }

  forNoKeyShare() {
    this.tokens.push(new StringToken(`FOR UPDATE`));
    return this;
  }

  of(...tables: Table<any>[]) {
    this.tokens.push(
      new StringToken(`OF`),
      new SeparatorToken(
        `,`,
        tables.map(table => new StringToken(table.getName())),
      ),
    );
    return this;
  }

  skipLocked() {
    this.tokens.push(new StringToken(`SKIP LOCKED`));
    return this;
  }

  nowait() {
    this.tokens.push(new StringToken(`NOWAIT`));
    return this;
  }

  groupBy(...columns: ColumnWrapper<any, any, any, any, any>[]) {
    this.tokens.push(
      new StringToken(`GROUP BY`),
      new SeparatorToken(
        `,`,
        columns.map(column => new CollectionToken(column!.toTokens())),
      ),
    );
    return this;
  }
}
