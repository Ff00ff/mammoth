import { CollectionToken, GroupToken, SeparatorToken, StringToken, Token } from './tokens';
import { QueryExecutorFn } from './types';

import { Expression } from './expression';
import { Query } from './query';
import { ResultSet, ResultSetDataType } from './result-set';
import { SelectQuery } from './select';
import { wrapQuotes } from './naming';

export type FromItem<Q> = Q extends Query<any>
  ? FromItemQuery<Q>
  : Q extends (args: any) => infer R
  ? R extends Query<any>
    ? FromItemQuery<R>
    : never
  : never;

type FromItemQuery<Q, Result = Q extends Query<any> ? ResultSet<Q> : never> = {
  [K in keyof Result]: Result[K] extends ResultSetDataType<infer DataType, infer IsNotNull>
    ? Expression<DataType, IsNotNull, K extends string ? K : never>
    : never;
};

type QueryFn<T> = Query<any> | ((args: T) => Query<any>);

export interface WithFn {
  <N1 extends string, W1 extends QueryFn<never>, Q extends Query<any>>(
    name1: N1,
    with1: W1,
    callback: (args: { [K in N1]: FromItem<W1> }) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    callback: (args: { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    Q extends Query<any>,
  >(
    name1: N1,
    with1: W1,
    name2: N2,
    with2: W2,
    name3: N3,
    with3: W3,
    callback: (
      args: { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> }
    >,
    N8 extends string,
    W8 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> } &
        { [K in N8]: FromItem<W8> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> }
    >,
    N8 extends string,
    W8 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> }
    >,
    N9 extends string,
    W9 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> } &
        { [K in N8]: FromItem<W8> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> } &
        { [K in N8]: FromItem<W8> } &
        { [K in N9]: FromItem<W9> },
    ) => Q,
  ): Q;
  <
    N1 extends string,
    W1 extends QueryFn<never>,
    N2 extends string,
    W2 extends QueryFn<{ [K in N1]: FromItem<W1> }>,
    N3 extends string,
    W3 extends QueryFn<{ [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> }>,
    N4 extends string,
    W4 extends QueryFn<
      { [K in N1]: FromItem<W1> } & { [K in N2]: FromItem<W2> } & { [K in N3]: FromItem<W3> }
    >,
    N5 extends string,
    W5 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> }
    >,
    N6 extends string,
    W6 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> }
    >,
    N7 extends string,
    W7 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> }
    >,
    N8 extends string,
    W8 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> }
    >,
    N9 extends string,
    W9 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> } &
        { [K in N8]: FromItem<W8> }
    >,
    N10 extends string,
    W10 extends QueryFn<
      { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> } &
        { [K in N8]: FromItem<W8> } &
        { [K in N9]: FromItem<W9> }
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
      args: { [K in N1]: FromItem<W1> } &
        { [K in N2]: FromItem<W2> } &
        { [K in N3]: FromItem<W3> } &
        { [K in N4]: FromItem<W4> } &
        { [K in N5]: FromItem<W5> } &
        { [K in N6]: FromItem<W6> } &
        { [K in N7]: FromItem<W7> } &
        { [K in N8]: FromItem<W8> } &
        { [K in N9]: FromItem<W9> } &
        { [K in N10]: FromItem<W10> },
    ) => Q,
  ): Q;
}

export const makeWith =
  (queryExecutor: QueryExecutorFn): WithFn =>
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
          fromItem[key] = new Expression(
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
      new StringToken(`WITH`),
      new SeparatorToken(`,`, tokens),
      ...query.toTokens(),
    ]) as any;
  };
