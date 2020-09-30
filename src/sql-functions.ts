import { Condition, makeCondition } from './condition';
import { Expression, NamedExpression, makeExpression, makeNamedExpression } from './expression';
import { GroupToken, ParameterToken, StringToken } from './tokens';

export const any = <T>(array: T[]) =>
  makeExpression<T>([new StringToken(`ANY`), new GroupToken([new ParameterToken(array)])]);

export const now = () => makeExpression<Date>([new StringToken(`NOW()`)]);

export const count = (
  expression?: Expression<any, any>,
): NamedExpression<'count', string, true> => {
  if (!expression) {
    return makeNamedExpression([new StringToken(`COUNT(*)`)]);
  }

  const tokens = expression.toTokens(false);

  return makeNamedExpression([new StringToken(`COUNT`), new GroupToken(tokens)]);
};

export const min = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  makeNamedExpression<'min', DataType, IsNotNull>([
    new StringToken(`MIN`),
    new GroupToken(expression.toTokens()),
  ]);

export const max = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  makeNamedExpression<'max', DataType, IsNotNull>([
    new StringToken(`MAX`),
    new GroupToken(expression.toTokens()),
  ]);

export const avg = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  makeNamedExpression<'avg', DataType, true>([
    new StringToken(`AVG`),
    new GroupToken(expression.toTokens()),
  ]);

export const sum = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>,
) =>
  makeNamedExpression<'sum', DataType, IsNotNull>([
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
