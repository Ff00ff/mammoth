// This is used so we can capture the Returning of every different query type without having to
// specify every query seperately. The private property is used to simulate a nominal type so only
import { DbConfig, GetResultType } from './config';

import { ResultSet } from './result-set';
import { Token } from './tokens';

export type SpecificQuery<
  Config extends DbConfig,
  DataType,
  Q extends Query<any>,
  Result = ResultSet<Config, Q, false>,
> = Result extends {
  [K in keyof Result]: GetResultType<Config, DataType> | GetResultType<Config, 'Null'>;
}
  ? Q
  : never;

export type BooleanQuery<Config extends DbConfig, Q extends Query<any>> = SpecificQuery<
  Config,
  boolean,
  Q
>;

export type AnyQuery = Query<any>;

// this class is captured when doing a conditional type check (through T extends Query<infer Returning>).
export abstract class Query<Returning> {
  private _queryBrand!: ['query', Returning];
  /** @internal */
  abstract toTokens(includeAlias?: boolean): Token[];
  /** @internal */
  abstract getReturningKeys(): string[];
}
