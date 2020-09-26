import { Condition, makeCondition } from "./condition";
import { GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from "./tokens";

import { SelectQuery } from "./select";

export interface NamedExpression<Name, DataType, IsNotNull extends boolean>
  extends InternalExpression<Name, DataType, IsNotNull> {
  as<NewName extends string>(name: NewName): NamedExpression<NewName, DataType, IsNotNull>;
}

// extends Expression<DataType, IsNotNull>
export interface InternalExpression<Name, DataType, IsNotNull extends boolean> {
  //

  isNull(): Condition;
  isNotNull(): Condition;

  asc(): Expression<DataType, IsNotNull>;
  desc(): Expression<DataType, IsNotNull>;
  nullsFirst(): Expression<DataType, IsNotNull>;
  nullsLast(): Expression<DataType, IsNotNull>;

  in(array: DataType[] | Expression<DataType, IsNotNull> | SelectQuery<any>): Condition;

  plus(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull>;
  minus(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull>;
  multiply(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull>;
  divide(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull>;
  modulo(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull>;
  concat(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull>;

  between(a: DataType): { and(b: DataType): Condition };
  betweenSymmetric(a: DataType): { and(b: DataType): Condition };

  isDistinctFrom(a: DataType): Condition;

  isNotDistinctFrom(a: DataType): Condition;

  notIn(value: DataType[] | Expression<DataType, IsNotNull>): Condition;

  like(value: DataType): Condition;

  ilike(value: DataType): Condition;

  eq(value: DataType | Expression<DataType, IsNotNull>): Condition;

  ne(value: DataType | Expression<DataType, IsNotNull>): Condition;
  gt(value: DataType | Expression<DataType, IsNotNull>): Condition;
  gte(value: DataType | Expression<DataType, IsNotNull>): Condition;

  lt(value: DataType | Expression<DataType, IsNotNull>): Condition;
  lte(value: DataType | Expression<DataType, IsNotNull>): Condition;

  // /** @internal */
  toTokens(): Token[];
}

// An expression is a combination of things which evaluates to one or more values
export type Expression<DataType, IsNotNull extends boolean> = NamedExpression<
  '?column?',
  DataType,
  IsNotNull
>;

export const makeNamedExpression = <Name extends string, DataType, IsNotNull extends boolean>(
  tokenFactory: (aliasBehaviour: 'INCLUDE' | 'EXCLUDE') => Token[]
): NamedExpression<Name, DataType, IsNotNull> => makeExpression(tokenFactory) as any;

export const makeExpression = <DataType>(tokenFactory: (aliasBehaviour: 'INCLUDE' | 'EXCLUDE') => Token[]): Expression<DataType, true> => {
  //

  const getDataTypeTokens = (value: DataType | Expression<DataType, true>) => {
    if (
      value &&
      typeof value === `object` &&
      'toTokens' in value &&
      typeof value.toTokens === `function`
    ) {
      return value.toTokens();
    }

    return [new ParameterToken(value)];
  };

  return {
    as(name) {
      const tokens = tokenFactory('INCLUDE');

      if (tokens.length > 1) {
        return makeExpression((aliasBehaviour) => {
          if (aliasBehaviour === `INCLUDE`) {
            return [new GroupToken(tokens), new StringToken(`"${name}"`)];
          }

          return [...tokens];
        });
      }

      return makeExpression((aliasBehaviour) => {
        if (aliasBehaviour === `INCLUDE`) {
          return [...tokens, new StringToken(`"${name}"`)]
        }

        return [...tokens];
      });
    },

    isNull() {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`IS NULL`)]);
    },

    isNotNull(): Condition {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`IS NOT NULL`)]);
    },

    asc() {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`ASC`)]);
    },

    desc() {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`DESC`)]);
    },

    nullsFirst() {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`NULLS FIRST`)]);
    },

    nullsLast() {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`NULLS LAST`)]);
    },

    // IN ($1, $2, $3)
    // IN foo.id
    // IN (SELECT * FROM test)
    in(array) {
      const tokens = tokenFactory('EXCLUDE');

      if ('toTokens' in array) {
        return makeCondition([...tokens, new StringToken(`IN`), new GroupToken(array.toTokens())]);
      } else {
        return makeCondition([
          ...tokens,
          new StringToken(`IN`),
          new GroupToken([
            new SeparatorToken(
              ',',
              array.map((item) => new ParameterToken(item))
            ),
          ]),
        ]);
      }
    },

    plus(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`+`), ...getDataTypeTokens(value)]);
    },

    minus(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`-`), ...getDataTypeTokens(value)]);
    },

    multiply(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`*`), ...getDataTypeTokens(value)]);
    },

    divide(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`/`), ...getDataTypeTokens(value)]);
    },

    modulo(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`%`), ...getDataTypeTokens(value)]);
    },

    concat(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeExpression(() => [...tokens, new StringToken(`||`), ...getDataTypeTokens(value)]);
    },

    between(a) {
      const tokens = tokenFactory('EXCLUDE');

      return {
        and(b) {
          return makeCondition([
            ...tokens,
            new StringToken(`BETWEEN`),
            new ParameterToken(a),
            new StringToken(`AND`),
            new ParameterToken(b),
          ]);
        },
      };
    },

    betweenSymmetric(a) {
      const tokens = tokenFactory('EXCLUDE');

      return {
        and(b) {
          return makeCondition([
            ...tokens,
            new StringToken(`BETWEEN SYMMETRIC`),
            new ParameterToken(a),
            new StringToken(`AND`),
            new ParameterToken(b),
          ]);
        },
      };
    },
    isDistinctFrom(a) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`IS DISTINCT FROM`), new ParameterToken(a)]);
    },
    isNotDistinctFrom(a) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([
        ...tokens,
        new StringToken(`IS NOT DISTINCT FROM`),
        new ParameterToken(a),
      ]);
    },

    notIn(value) {
      const tokens = tokenFactory('EXCLUDE');

      if ('toTokens' in value) {
        return makeCondition([
          ...tokens,
          new StringToken(`NOT IN`),
          new GroupToken(value.toTokens()),
        ]);
      } else {
        return makeCondition([
          ...tokens,
          new StringToken(`NOT IN`),
          new GroupToken(value.map((item) => new ParameterToken(item))),
        ]);
      }
    },

    like(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`LIKE`), new ParameterToken(value)]);
    },

    ilike(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`ILIKE`), new ParameterToken(value)]);
    },

    eq(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`=`), ...getDataTypeTokens(value)]);
    },

    ne(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`<>`), ...getDataTypeTokens(value)]);
    },

    gt(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`>`), ...getDataTypeTokens(value)]);
    },

    gte(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`>=`), ...getDataTypeTokens(value)]);
    },

    lt(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`<`), ...getDataTypeTokens(value)]);
    },

    lte(value) {
      const tokens = tokenFactory('EXCLUDE');

      return makeCondition([...tokens, new StringToken(`<=`), ...getDataTypeTokens(value)]);
    },

    toTokens() {
      const tokens = tokenFactory('INCLUDE');

      return tokens;
    },
  };
};