import { Condition, makeCondition } from './condition';
import { GroupToken, ParameterToken, StringToken } from './tokens';

import { Expression } from './expression';

export const any = <T>(array: T[]) =>
  new Expression<T, true>([new StringToken(`ANY`), new GroupToken([new ParameterToken(array)])]);

export const now = () => new Expression<Date, true>([new StringToken(`NOW()`)]);

export const count = (expression?: Expression<any, any>): Expression<string, true, 'count'> => {
  if (!expression) {
    return new Expression([new StringToken(`COUNT(*)`)]);
  }

  const tokens = expression.toTokens(false);

  return new Expression([new StringToken(`COUNT`), new GroupToken(tokens)]);
};

export const min = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  new Expression<DataType, IsNotNull, 'min'>([
    new StringToken(`MIN`),
    new GroupToken(expression.toTokens()),
  ]);

export const max = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  new Expression<DataType, IsNotNull, 'max'>([
    new StringToken(`MAX`),
    new GroupToken(expression.toTokens()),
  ]);

export const avg = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  new Expression<DataType, true, 'avg'>([
    new StringToken(`AVG`),
    new GroupToken(expression.toTokens()),
  ]);

export const sum = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  new Expression<DataType, IsNotNull, 'sum'>([
    new StringToken(`SUM`),
    new GroupToken(expression.toTokens()),
  ]);

export const not = (condition: Condition) =>
  makeCondition([new StringToken(`NOT`), new GroupToken(condition.toTokens())]);

export const and = (condition: Condition) =>
  makeCondition([new StringToken(`AND`), new GroupToken(condition.toTokens())]);

export const or = (condition: Condition) =>
  makeCondition([new StringToken(`OR`), new GroupToken(condition.toTokens())]);

export const group = (condition: Condition) =>
  makeCondition([new GroupToken(condition.toTokens())]);
