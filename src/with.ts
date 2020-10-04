import { CollectionToken, GroupToken, SeparatorToken, StringToken, Token } from './tokens';
import { GetDataType, QueryExecutorFn } from './types';

import { Expression } from './expression';
import { Query } from './query';
import { ResultSet } from './result-set';
import { SelectQuery } from './select';
import { wrapQuotes } from './naming/snake-case';

export type FromItem<Q> = Q extends Query<any>
  ? FromItemQuery<Q>
  : Q extends (args: any) => infer R
  ? R extends Query<any>
    ? FromItemQuery<R>
    : never
  : never;

type FromItemQuery<Q, Result = Q extends Query<any> ? ResultSet<Q, true> : never> = {
  [K in keyof Result]: Result[K] extends GetDataType<infer DataType, infer IsNotNull>
    ? Expression<DataType, IsNotNull, K extends string ? K : never>
    : never;
};

type QueryFn<T> = Query<any> | ((args: T) => Query<any>);

export interface WithFn {
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    Q extends Query<any>
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    callback: (args: { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }) => Q,
  ): Q;
}

export const makeWith = (queryExecutor: QueryExecutorFn): WithFn => (...args: any[]) => {
  const queries: any = {};

  const createWith = (withFn: QueryFn<any>) => {
    if (withFn instanceof Query) {
      return withFn;
    }

    return withFn(queries);
  };

  const createFromItem = (name: string, query: Query<any>) => {
    const fromItem = {
      ...query.getReturningKeys().reduce((fromItem, key) => {
        fromItem[key] = new Expression(
          [new StringToken(`${wrapQuotes(name)}.${wrapQuotes(key)}`)],
          key,
        );
        return fromItem;
      }, {} as any),

      getName() {
        return `"${name}"`;
      },

      getOriginalName() {
        return undefined;
      },
    };

    return fromItem;
  };

  const tokens: Token[] = [];

  for (let i = 0; i < args.length - 1; i += 2) {
    const name = args[i];
    const withQuery = createWith(args[i + 1]);

    tokens.push(
      new CollectionToken([
        new StringToken(`"${name}"`),
        new StringToken(`AS`),
        new GroupToken(withQuery.toTokens()),
      ]),
    );

    queries[name] = createFromItem(name, withQuery);
  }

  const callback = args[args.length - 1];

  const query: Query<any> = callback(queries);

  return new SelectQuery(
    queryExecutor,
    [],
    [new StringToken(`WITH`), new SeparatorToken(`,`, tokens), ...query.toTokens()],
  ) as any;
};
