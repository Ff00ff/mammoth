import { QueryExecutorFn, ResultType } from './types';
import { StringToken, Token, createQueryState } from './tokens';

import { DbConfig } from './config';
import { Query } from './query';
import { AnyTable, Table } from './TableType';
import { TableDefinition } from './table';

export const makeTruncate =
  <Config extends DbConfig>(queryExecutor: QueryExecutorFn) =>
  <T extends AnyTable>(table: T): T extends TableDefinition<any> ? never : TruncateQuery<T> => {
    return new TruncateQuery<T>(queryExecutor, table, 'AFFECTED_COUNT', [
      new StringToken(`TRUNCATE`),
      new StringToken((table as AnyTable).getName()),
    ]) as any;
  };

export class TruncateQuery<T extends AnyTable, Returning = number> extends Query<Returning> {
  constructor(
    private readonly queryExecutor: QueryExecutorFn,
    private readonly table: T,
    private readonly resultType: ResultType,
    private readonly tokens: Token[],
  ) {
    super();
  }

  then<Result1, Result2 = never>(
    onFulfilled?: ((value: number) => Result1 | PromiseLike<Result1>) | undefined | null,
    onRejected?: ((reason: any) => Result2 | PromiseLike<Result2>) | undefined | null,
  ): Promise<Result1 | Result2> {
    const queryState = createQueryState(this.tokens);

    return this.queryExecutor(queryState.text.join(` `), queryState.parameters)
      .then((result) => onFulfilled?.(result.affectedCount))
      .catch(onRejected) as any;
  }

  restartIdentity() {
    return this.newTruncateQuery([...this.tokens, new StringToken(`RESTART IDENTITY`)]) as any;
  }

  continueIdentity() {
    return this.newTruncateQuery([...this.tokens, new StringToken(`CONTINUE IDENTITY`)]) as any;
  }

  cascade() {
    return this.newTruncateQuery([...this.tokens, new StringToken('CASCADE')]);
  }

  restrict() {
    return this.newTruncateQuery([...this.tokens, new StringToken('RESTRICT')]);
  }

  private newTruncateQuery(tokens: Token[]): TruncateQuery<any> {
    return new TruncateQuery(this.queryExecutor, this.table, 'AFFECTED_COUNT', tokens);
  }

  getReturningKeys(): string[] {
    return [];
  }

  toTokens(): Token[] {
    return this.tokens;
  }
}
