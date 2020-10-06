import {
  CollectionToken,
  EmptyToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
} from './tokens';
import { Condition, makeCondition } from './condition';

import { Expression } from './expression';
import { Query } from './query';

export const stringAgg = (
  expression: Expression<string, boolean, any>,
  delimiter: string,
  ...orderBy: Expression<any, any, any>[]
): Expression<string, false, 'stringAgg'> => {
  return new Expression(
    [
      new StringToken(`string_agg`),
      new GroupToken([
        new SeparatorToken(',', [
          new CollectionToken(expression.toTokens(false)),
          new CollectionToken([
            new ParameterToken(delimiter),
            orderBy
              ? new CollectionToken([
                  new StringToken(`ORDER BY`),
                  new SeparatorToken(
                    `,`,
                    orderBy.map((expression) => new CollectionToken(expression.toTokens())),
                  ),
                ])
              : new EmptyToken(),
          ]),
        ]),
      ]),
    ],
    'stringAgg',
  );
};

export const bitAnd = (expression: Expression<number, boolean, any>) =>
  new Expression<number, false, 'bitAnd'>(
    [new StringToken(`bit_and`), new GroupToken(expression.toTokens(false))],
    'bitAnd',
  );
export const bitOr = (expression: Expression<number, boolean, any>) =>
  new Expression<number, false, 'bitOr'>(
    [new StringToken(`bit_or`), new GroupToken(expression.toTokens(false))],
    'bitOr',
  );

export const boolAnd = (expression: Expression<boolean, boolean, any>) =>
  new Expression<number, false, 'boolAnd'>(
    [new StringToken(`bool_and`), new GroupToken(expression.toTokens(false))],
    'boolAnd',
  );

export const boolOr = (expression: Expression<boolean, boolean, any>) =>
  new Expression<number, false, 'boolOr'>(
    [new StringToken(`bool_or`), new GroupToken(expression.toTokens(false))],
    'boolOr',
  );

export const every = (expression: Expression<boolean, boolean, any>) =>
  new Expression<number, false, 'every'>(
    [new StringToken(`every`), new GroupToken(expression.toTokens(false))],
    'every',
  );

export const arrayAgg = <DataType>(expression: Expression<DataType, boolean, any>) =>
  new Expression<DataType[], false, 'arrayAgg'>(
    [new StringToken(`array_agg`), new GroupToken(expression.toTokens(false))],
    'arrayAgg',
  );

export const count = (
  expression?: Expression<any, any, any>,
): Expression<string, true, 'count'> => {
  if (!expression) {
    return new Expression<string, true, 'count'>([new StringToken(`COUNT(*)`)], 'count');
  }

  const tokens = expression.toTokens();

  return new Expression<string, true, 'count'>(
    [new StringToken(`COUNT`), new GroupToken(tokens)],
    'count',
  );
};

export const min = <DataType>(
  expression: Expression<DataType, boolean, any>,
): Expression<DataType, false, 'min'> =>
  new Expression<DataType, false, 'min'>(
    [new StringToken(`MIN`), new GroupToken(expression.toTokens())],
    'min',
  );

export const max = <DataType>(expression: Expression<DataType, boolean, any>) =>
  new Expression<DataType, false, 'max'>(
    [new StringToken(`MAX`), new GroupToken(expression.toTokens())],
    'max',
  );

export const avg = (expression: Expression<number, boolean, any>) =>
  new Expression<number, false, 'avg'>(
    [new StringToken(`AVG`), new GroupToken(expression.toTokens())],
    'avg',
  );

export const sum = (expression: Expression<number, boolean, any>) =>
  new Expression<number, false, 'sum'>(
    [new StringToken(`SUM`), new GroupToken(expression.toTokens())],
    'sum',
  );

export const xmlagg = <DataType>(expression: Expression<DataType, boolean, any>) =>
  new Expression<number, false, 'xmlagg'>(
    [new StringToken(`xmlagg`), new GroupToken(expression.toTokens())],
    'xmlagg',
  );

export const not = (condition: Condition) =>
  makeCondition([new StringToken(`NOT`), new GroupToken(condition.toTokens())]);

export const and = (condition: Condition) =>
  makeCondition([new StringToken(`AND`), new GroupToken(condition.toTokens())]);

export const or = (condition: Condition) =>
  makeCondition([new StringToken(`OR`), new GroupToken(condition.toTokens())]);

export const group = (condition: Condition) =>
  makeCondition([new GroupToken(condition.toTokens())]);

export const any = <T>(array: T[]) =>
  new Expression<T, true, '?column?'>(
    [new StringToken(`ANY`), new GroupToken([new ParameterToken(array)])],
    '?column?',
  );

export const now = () => new Expression<Date, true, 'now'>([new StringToken(`NOW()`)], 'now');

export const exists = (expression: Expression<any, any, any> | Query<any>): Condition =>
  makeCondition([new StringToken(`EXISTS`), new GroupToken(expression.toTokens())]);

export const notExists = (expression: Expression<any, any, any> | Query<any>): Condition =>
  makeCondition([new StringToken(`NOT EXISTS`), new GroupToken(expression.toTokens())]);

export const coalesce = <DataType>(
  ...expressions: (Expression<DataType, boolean, any> | DataType)[]
) => {
  return new Expression<DataType, true, 'coalesce'>(
    [
      new StringToken(`coalesce`),
      new GroupToken([
        new SeparatorToken(
          ',',
          expressions.map((expression) =>
            expression instanceof Expression
              ? new CollectionToken(expression.toTokens())
              : new ParameterToken(expression),
          ),
        ),
      ]),
    ],
    'coalesce',
  );
};
