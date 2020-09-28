import { Condition, makeCondition } from "./condition";
import { GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from "./tokens";

import { Query } from "./query";

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

  in(array: DataType[] | Expression<DataType, IsNotNull> | Query<any>): Condition;

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

  /** @internal */
  toTokens(includeAlias?: boolean): Token[];
}

// An expression is a combination of things which evaluates to one or more values
export type Expression<DataType, IsNotNull extends boolean> = NamedExpression<
  '?column?',
  DataType,
  IsNotNull
>;

export const makeNamedExpression = <Name extends string, DataType, IsNotNull extends boolean>(
  tokens: Token[]
): NamedExpression<Name, DataType, IsNotNull> => makeExpression(tokens) as any;

export const makeExpression = <DataType>(tokens: Token[]): Expression<DataType, true> => {
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
      if (tokens.length > 2) {
        return makeExpression([new GroupToken(tokens), new StringToken(`"${name}"`)]);
      }

      return makeExpression([...tokens, new StringToken(`"${name}"`)]);
    },

    isNull() {
      return makeCondition([...tokens, new StringToken(`IS NULL`)]);
    },

    isNotNull(): Condition {
      return makeCondition([...tokens, new StringToken(`IS NOT NULL`)]);
    },

    asc() {
      return makeExpression([...tokens, new StringToken(`ASC`)]);
    },

    desc() {
      return makeExpression([...tokens, new StringToken(`DESC`)]);
    },

    nullsFirst() {
      return makeExpression([...tokens, new StringToken(`NULLS FIRST`)]);
    },

    nullsLast() {
      return makeExpression([...tokens, new StringToken(`NULLS LAST`)]);
    },

    // IN ($1, $2, $3)
    // IN foo.id
    // IN (SELECT * FROM test)
    in(array) {
      if (array && ('toTokens' in array || array instanceof Query)) {
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
      return makeExpression([...tokens, new StringToken(`+`), ...getDataTypeTokens(value)]);
    },

    minus(value) {
      return makeExpression([...tokens, new StringToken(`-`), ...getDataTypeTokens(value)]);
    },

    multiply(value) {
      return makeExpression([...tokens, new StringToken(`*`), ...getDataTypeTokens(value)]);
    },

    divide(value) {
      return makeExpression([...tokens, new StringToken(`/`), ...getDataTypeTokens(value)]);
    },

    modulo(value) {
      return makeExpression([...tokens, new StringToken(`%`), ...getDataTypeTokens(value)]);
    },

    concat(value) {
      return makeExpression([...tokens, new StringToken(`||`), ...getDataTypeTokens(value)]);
    },

    between(a) {
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
      return makeCondition([...tokens, new StringToken(`IS DISTINCT FROM`), new ParameterToken(a)]);
    },
    isNotDistinctFrom(a) {
      return makeCondition([
        ...tokens,
        new StringToken(`IS NOT DISTINCT FROM`),
        new ParameterToken(a),
      ]);
    },

    notIn(value) {
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
      return makeCondition([...tokens, new StringToken(`LIKE`), new ParameterToken(value)]);
    },

    ilike(value) {
      return makeCondition([...tokens, new StringToken(`ILIKE`), new ParameterToken(value)]);
    },

    eq(value) {
      return makeCondition([...tokens, new StringToken(`=`), ...getDataTypeTokens(value)]);
    },

    ne(value) {
      return makeCondition([...tokens, new StringToken(`<>`), ...getDataTypeTokens(value)]);
    },

    gt(value) {
      return makeCondition([...tokens, new StringToken(`>`), ...getDataTypeTokens(value)]);
    },

    gte(value) {
      return makeCondition([...tokens, new StringToken(`>=`), ...getDataTypeTokens(value)]);
    },

    lt(value) {
      return makeCondition([...tokens, new StringToken(`<`), ...getDataTypeTokens(value)]);
    },

    lte(value) {
      return makeCondition([...tokens, new StringToken(`<=`), ...getDataTypeTokens(value)]);
    },

    toTokens() {
      return tokens;
    },
  };
};