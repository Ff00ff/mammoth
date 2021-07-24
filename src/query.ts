// This is used so we can capture the Returning of every different query type without having to
// specify every query seperately. The private property is used to simulate a nominal type so only
import { ResultSet } from './result-set';
import { Token } from './tokens';

export type SpecificQuery<
  DataType,
  Q extends Query<any>,
  Result = ResultSet<Q, false>,
> = Result extends {
  [K in keyof Result]: DataType | undefined;
}
  ? Q
  : never;

export type BooleanQuery<Q extends Query<any>> = SpecificQuery<boolean, Q>;

// this class is captured when doing a conditional type check (through T extends Query<infer Returning>).
export abstract class Query<Returning> {
  private _queryBrand!: ['query', Returning];
  /** @internal */
  abstract toTokens(includeAlias?: boolean): Token[];
  /** @internal */
  abstract getReturningKeys(): string[];
}
