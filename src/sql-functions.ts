import { Condition, makeCondition } from './condition';
import { GroupToken, ParameterToken, StringToken } from './tokens';

import { Expression } from './expression';

export const any = <T>(array: T[]) =>
  new Expression<T, true, '?column?'>(
    [new StringToken(`ANY`), new GroupToken([new ParameterToken(array)])],
    '?column?',
  );

export const now = () => new Expression<Date, true, 'now'>([new StringToken(`NOW()`)], `now`);

export const count = (
  expression?: Expression<any, any, any>,
): Expression<string, true, 'count'> => {
  if (!expression) {
    return new Expression([new StringToken(`COUNT(*)`)], `count`);
  }

  const tokens = expression.toTokens(false);

  return new Expression([new StringToken(`COUNT`), new GroupToken(tokens)], `count`);
};

export const min = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull, any>,
) =>
  new Expression<DataType, IsNotNull, 'min'>(
    [new StringToken(`MIN`), new GroupToken(expression.toTokens())],
    `min`,
  );

export const max = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull, any>,
) =>
  new Expression<DataType, IsNotNull, 'max'>(
    [new StringToken(`MAX`), new GroupToken(expression.toTokens())],
    `max`,
  );

export const avg = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull, any>,
) =>
  new Expression<DataType, true, 'avg'>(
    [new StringToken(`AVG`), new GroupToken(expression.toTokens())],
    `avg`,
  );

export const sum = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull, any>,
) =>
  new Expression<DataType, IsNotNull, 'sum'>(
    [new StringToken(`SUM`), new GroupToken(expression.toTokens())],
    'sum',
  );

export const not = (condition: Condition) =>
  makeCondition([new StringToken(`NOT`), new GroupToken(condition.toTokens())]);

export const and = (condition: Condition) =>
  makeCondition([new StringToken(`AND`), new GroupToken(condition.toTokens())]);

export const or = (condition: Condition) =>
  makeCondition([new StringToken(`OR`), new GroupToken(condition.toTokens())]);

export const group = (condition: Condition) =>
  makeCondition([new GroupToken(condition.toTokens())]);
