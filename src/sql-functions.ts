import { Condition, makeCondition } from "./condition";
import { Expression, NamedExpression, makeExpression, makeNamedExpression } from "./expression";
import { GroupToken, StringToken } from "./tokens";

export const now = () => makeExpression<Date>(() => [new StringToken(`NOW()`)]);

export const count = (expression?: Expression<any, any>): NamedExpression<'count', string, true> =>
  expression
    ? makeNamedExpression(() => [new StringToken(`COUNT`), new GroupToken(expression.toTokens())])
    : makeNamedExpression(() => [new StringToken(`COUNT(*)`)]);

export const min = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>
) =>
  makeNamedExpression<'min', DataType, IsNotNull>(() => [
    new StringToken(`MIN`),
    new GroupToken(expression.toTokens()),
  ]);

export const max = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>
) =>
  makeNamedExpression<'max', DataType, IsNotNull>(() => [
    new StringToken(`MAX`),
    new GroupToken(expression.toTokens()),
  ]);

export const avg = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>
) =>
  makeNamedExpression<'avg', DataType, true>(() => [
    new StringToken(`AVG`),
    new GroupToken(expression.toTokens()),
  ]);

export const sum = <DataType, IsNotNull extends boolean>(
  expression: Expression<DataType, IsNotNull>
) =>
  makeNamedExpression<'sum', DataType, IsNotNull>(() => [
    new StringToken(`SUM`),
    new GroupToken(expression.toTokens()),
  ]);

export const group = (condition: Condition) =>
  makeCondition([new GroupToken(condition.toTokens())]);
