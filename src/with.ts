import { CollectionToken, GroupToken, SeparatorToken, StringToken, Token } from './tokens';
import { Expression, InternalExpression } from './expression';
import { GetDataType, QueryExecutorFn } from './types';

import { DbConfig } from './config';
import { Query } from './query';
import { ResultSet } from './result-set';
import { SelectQuery } from './select';
import { wrapQuotes } from './naming';

export type FromItem<Config extends DbConfig, Q> = Q extends Query<any>
  ? FromItemQuery<Config, Q>
  : Q extends (args: any) => infer R
  ? R extends Query<any>
    ? FromItemQuery<Config, R>
    : never
  : never;

type FromItemQuery<
  Config extends DbConfig,
  Q,
  Result = Q extends Query<any> ? ResultSet<Config, Q, true> : never,
> = {
  [K in keyof Result]: Result[K] extends GetDataType<infer DataType, infer IsNotNull>
    ? Expression<Config, DataType, IsNotNull, K extends string ? K : never>
    : never;
};

type QueryFn<T> = Query<any> | ((args: T) => Query<any>);

export interface WithFn<Config extends DbConfig> {
  <N1 extends string, W1 extends QueryFn<never>, Q extends Query<any>>(
    name1: N1,
    with1: W1,
    callback: (args: { [K in N1]: FromItem<Config, W1> }) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    name5: N5,
    with5: W5,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    name5: N5,
    with5: W5,
    name6: N6,
    with6: W6,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    name5: N5,
    with5: W5,
    name6: N6,
    with6: W6,
    name7: N7,
    with7: W7,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> }
    >,
    N8 extends string,
    W8 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    name5: N5,
    with5: W5,
    name6: N6,
    with6: W6,
    name7: N7,
    with7: W7,
    name8: N8,
    with8: W8,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> } &
        { [K in N8]: FromItem<Config, W8> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> }
    >,
    N8 extends string,
    W8 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> }
    >,
    N9 extends string,
    W9 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> } &
        { [K in N8]: FromItem<Config, W8> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    name5: N5,
    with5: W5,
    name6: N6,
    with6: W6,
    name7: N7,
    with7: W7,
    name8: N8,
    with8: W8,
    name9: N9,
    with9: W9,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> } &
        { [K in N8]: FromItem<Config, W8> } &
        { [K in N9]: FromItem<Config, W9> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<Config, W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<Config, W1> } & { [K in N2]: FromItem<Config, W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> }
    >,
    N8 extends string,
    W8 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> }
    >,
    N9 extends string,
    W9 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> } &
        { [K in N8]: FromItem<Config, W8> }
    >,
    N10 extends string,
    W10 extends QueryFn<
      { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> } &
        { [K in N8]: FromItem<Config, W8> } &
        { [K in N9]: FromItem<Config, W9> }
    >,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    name4: N4,
    with4: W4,
    name5: N5,
    with5: W5,
    name6: N6,
    with6: W6,
    name7: N7,
    with7: W7,
    name8: N8,
    with8: W8,
    name9: N9,
    with9: W9,
    name10: N10,
    with10: W10,
    callback: (
      args: { [K in N1]: FromItem<Config, W1> } &
        { [K in N2]: FromItem<Config, W2> } &
        { [K in N3]: FromItem<Config, W3> } &
        { [K in N4]: FromItem<Config, W4> } &
        { [K in N5]: FromItem<Config, W5> } &
        { [K in N6]: FromItem<Config, W6> } &
        { [K in N7]: FromItem<Config, W7> } &
        { [K in N8]: FromItem<Config, W8> } &
        { [K in N9]: FromItem<Config, W9> } &
        { [K in N10]: FromItem<Config, W10> },
    ) => Q,
  ): Q;
}

const makeMakeWith =
  (initialTokens: Token[]) =>
  <Config extends DbConfig>(queryExecutor: QueryExecutorFn): WithFn<Config> =>
  (...args: any[]) => {
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
          fromItem[key] = new InternalExpression(
            [new StringToken(`${wrapQuotes(name)}.${wrapQuotes(key)}`)],
            key,
          );
          return fromItem;
        }, {} as any),

        getName() {
          return name;
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
          new StringToken(wrapQuotes(name)),
          new StringToken(`AS`),
          new GroupToken(withQuery.toTokens()),
        ]),
      );

      queries[name] = createFromItem(name, withQuery);
    }

    const callback = args[args.length - 1];

    const query: Query<any> = callback(queries);

    return new SelectQuery(queryExecutor, [], false, [
      ...initialTokens,
      new SeparatorToken(`,`, tokens),
      ...query.toTokens(),
    ]) as any;
  };

export const makeWith = makeMakeWith([new StringToken(`WITH`)]);
export const makeWithRecursive = makeMakeWith([new StringToken(`WITH RECURSIVE`)]);
