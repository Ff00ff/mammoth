import { AnyNumber, Int8 } from './data-types';
import {
  CollectionToken,
  EmptyToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
} from './tokens';
import { DefaultExpression, Expression } from './expression';

import { ColumnSet } from './column';
import { Query } from './query';
import { Table } from './TableType';
import { wrapQuotes } from './naming';

export class Star {
  private _starBrand: any;

  toTokens() {
    return [new StringToken(`*`)];
  }

  getName() {
    return `*`;
  }
}

export function raw<
  DataType = unknown,
  IsNotNull extends boolean = true,
  Name extends string = never
>(strings: TemplateStringsArray, ...parameters: any[]) {
  const tokens = strings.flatMap((string, index) => {
    if (index === strings.length - 1) {
      return [new StringToken(string)];
    }

    const parameter = parameters[index];
    return [new StringToken(string), new ParameterToken(parameter)];
  });

  return new Expression<DataType, IsNotNull, Name>(tokens, '' as any);
}

export function star(): Star;
export function star<T extends Table<any, any>>(
  table: T,
): T extends Table<any, infer Columns> ? ColumnSet<Columns> : never;
export function star(table?: Table<any, any>) {
  if (table) {
    return new Expression([new StringToken(`${wrapQuotes(table.getName())}.*`)], '') as any;
  }

  return new Star();
}

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

export const bitAnd = <T extends AnyNumber>(expression: Expression<T, boolean, any>) =>
  new Expression<T, false, 'bitAnd'>(
    [new StringToken(`bit_and`), new GroupToken(expression.toTokens(false))],
    'bitAnd',
  );
export const bitOr = <T extends AnyNumber>(expression: Expression<T, boolean, any>) =>
  new Expression<T, false, 'bitOr'>(
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

export const count = (expression?: Expression<any, any, any>): Expression<Int8, true, 'count'> => {
  if (!expression) {
    return new Expression<Int8, true, 'count'>([new StringToken(`COUNT(*)`)], 'count');
  }

  const tokens = expression.toTokens();

  return new Expression<Int8, true, 'count'>(
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

export const avg = <T extends AnyNumber>(expression: Expression<T, boolean, any>) =>
  new Expression<T, false, 'avg'>(
    [new StringToken(`AVG`), new GroupToken(expression.toTokens())],
    'avg',
  );

export const sum = <T extends AnyNumber>(expression: Expression<T, boolean, any>) =>
  new Expression<T, false, 'sum'>(
    [new StringToken(`SUM`), new GroupToken(expression.toTokens())],
    'sum',
  );

export const xmlagg = <DataType>(expression: Expression<DataType, boolean, any>) =>
  new Expression<number, false, 'xmlagg'>(
    [new StringToken(`xmlagg`), new GroupToken(expression.toTokens())],
    'xmlagg',
  );

export const not = (expression: Expression<boolean, boolean, string>) =>
  new DefaultExpression<boolean>([new StringToken(`NOT`), new GroupToken(expression.toTokens())]);

export const and = (expression: Expression<boolean, boolean, string>) =>
  new DefaultExpression<boolean>([new StringToken(`AND`), new GroupToken(expression.toTokens())]);

export const or = (expression: Expression<boolean, boolean, string>) =>
  new DefaultExpression<boolean>([new StringToken(`OR`), new GroupToken(expression.toTokens())]);

export const group = (expression: Expression<boolean, boolean, string>) =>
  new DefaultExpression<boolean>([new GroupToken(expression.toTokens())]);

export const any = <T>(array: T[]) =>
  new Expression<T, true, '?column?'>(
    [new StringToken(`ANY`), new GroupToken([new ParameterToken(array)])],
    '?column?',
  );

export const now = () => new Expression<Date, true, 'now'>([new StringToken(`NOW()`)], 'now');

export const exists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new DefaultExpression([new StringToken(`EXISTS`), new GroupToken(expression.toTokens())]);

export const andNotExists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new DefaultExpression([new StringToken(`AND NOT EXISTS`), new GroupToken(expression.toTokens())]);

export const andExists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new DefaultExpression([new StringToken(`AND EXISTS`), new GroupToken(expression.toTokens())]);

export const notExists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new DefaultExpression([new StringToken(`NOT EXISTS`), new GroupToken(expression.toTokens())]);

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
