import {
  AllStarToken,
  CollectionToken,
  EmptyToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  TableStarToken,
  createQueryState,
} from './tokens';
import { Any, AnyNumber, Int4, Int8, Text, ToPostgresDataType } from './data-types';
import {
  DefaultExpression,
  Expression,
  InternalDefaultExpression,
  InternalExpression,
  RawExpression,
} from './expression';

import type { ColumnSet } from './column';
import { GetResultType } from './config';
import { Query } from './query';
import { Table } from './TableType';

export class Star {
  private _starBrand: any;

  constructor(private readonly table?: Table<any, any>) {}

  toTokens() {
    if (this.table) {
      return [new TableStarToken(this.table)];
    }

    return [new AllStarToken()];
  }

  getName() {
    return `*`;
  }
}

export function raw<DataType, IsNotNull extends boolean = false, Name extends string = '?column?'>(
  strings: TemplateStringsArray,
  ...parameters: any[]
): Expression<DataType, IsNotNull, Name> {
  const tokens = strings.flatMap((string, index) => {
    if (index === strings.length - 1) {
      return [new StringToken(string)];
    }

    const parameter = parameters[index];
    return [new StringToken(string), new ParameterToken(parameter)];
  });

  return new InternalExpression(tokens, '' as any) as any;
}

export function star(): Star;
export function star<T extends Table<any, any>>(
  table: T,
): T extends Table<any, infer Columns> ? ColumnSet<Columns> : never;
export function star(table?: Table<any, any>) {
  if (table) {
    return new Star(table) as any;
  }

  return new Star();
}

export const stringAgg = (
  expression: Expression<Text, boolean, any>,
  delimiter: string,
  ...orderBy: Expression<any, any, any>[]
): Expression<Text, false, 'stringAgg'> => {
  return new InternalExpression(
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

export const bitAnd = <T extends AnyNumber>(
  expression: Expression<T, boolean, any>,
): Expression<T, false, 'bitAnd'> =>
  new InternalExpression(
    [new StringToken(`bit_and`), new GroupToken(expression.toTokens(false))],
    'bitAnd',
  ) as any;
export const bitOr = <T extends AnyNumber>(
  expression: Expression<T, boolean, any>,
): Expression<T, false, 'bitOr'> =>
  new InternalExpression<T, false, 'bitOr'>(
    [new StringToken(`bit_or`), new GroupToken(expression.toTokens(false))],
    'bitOr',
  ) as any;

export const boolAnd = (
  expression: Expression<boolean, boolean, any>,
): Expression<number, false, 'boolAnd'> =>
  new InternalExpression<number, false, 'boolAnd'>(
    [new StringToken(`bool_and`), new GroupToken(expression.toTokens(false))],
    'boolAnd',
  );

export const boolOr = (
  expression: Expression<boolean, boolean, any>,
): Expression<number, false, 'boolOr'> =>
  new InternalExpression<number, false, 'boolOr'>(
    [new StringToken(`bool_or`), new GroupToken(expression.toTokens(false))],
    'boolOr',
  );

export const every = (
  expression: Expression<boolean, boolean, any>,
): Expression<number, false, 'every'> =>
  new InternalExpression<number, false, 'every'>(
    [new StringToken(`every`), new GroupToken(expression.toTokens(false))],
    'every',
  );

export const arrayAgg = <DataType>(
  expression: Expression<DataType, boolean, any>,
): Expression<GetResultType<DataType>[], false, 'arrayAgg'> =>
  new InternalExpression(
    [new StringToken(`array_agg`), new GroupToken(expression.toTokens(false))],
    'arrayAgg',
  ) as any;

export const count = (expression?: Expression<any, any, any>): Expression<Int8, true, 'count'> => {
  if (!expression) {
    return new InternalExpression([new StringToken(`COUNT(*)`)], 'count');
  }

  const tokens = expression.toTokens();

  return new InternalExpression([new StringToken(`COUNT`), new GroupToken(tokens)], 'count');
};

export const min = <DataType>(
  expression: Expression<DataType, boolean, any>,
): Expression<DataType, false, 'min'> =>
  new InternalExpression<DataType, false, 'min'>(
    [new StringToken(`MIN`), new GroupToken(expression.toTokens())],
    'min',
  ) as any;

export const max = <DataType>(
  expression: Expression<DataType, boolean, any>,
): Expression<DataType, false, 'max'> =>
  new InternalExpression(
    [new StringToken(`MAX`), new GroupToken(expression.toTokens())],
    'max',
  ) as any;

export const avg = <T extends AnyNumber>(
  expression: Expression<T, boolean, any>,
): Expression<T, false, 'avg'> =>
  new InternalExpression(
    [new StringToken(`AVG`), new GroupToken(expression.toTokens())],
    'avg',
  ) as any;

// Selecting the sum of an int4 results in a int8, but selecting the sum of any other data type
// doesn't seem to change the return type at all.
export const sum = <T extends AnyNumber>(
  expression: Expression<T, boolean, any>,
): Expression<T extends Int4 ? Int8 : T, false, 'sum'> =>
  new InternalExpression<T, false, 'sum'>(
    [new StringToken(`SUM`), new GroupToken(expression.toTokens())],
    'sum',
  ) as any;

export const xmlagg = <DataType>(
  expression: Expression<DataType, boolean, any>,
): Expression<number, false, 'xmlagg'> =>
  new InternalExpression<number, false, 'xmlagg'>(
    [new StringToken(`xmlagg`), new GroupToken(expression.toTokens())],
    'xmlagg',
  );

export const not = (expression: Expression<boolean, boolean, string>): DefaultExpression<boolean> =>
  new InternalDefaultExpression<boolean>([
    new StringToken(`NOT`),
    new GroupToken(expression.toTokens()),
  ]) as any;

export const and = (expression: Expression<boolean, boolean, string>): DefaultExpression<boolean> =>
  new InternalDefaultExpression<boolean>([
    new StringToken(`AND`),
    new GroupToken(expression.toTokens()),
  ]) as any;

export const or = (expression: Expression<boolean, boolean, string>): DefaultExpression<boolean> =>
  new InternalDefaultExpression<boolean>([
    new StringToken(`OR`),
    new GroupToken(expression.toTokens()),
  ]) as any;

export const group = (
  expression: Expression<boolean, boolean, string>,
): DefaultExpression<boolean> =>
  new InternalDefaultExpression<boolean>([new GroupToken(expression.toTokens())]) as any;

export const any = <T>(array: T[]): RawExpression<T, true, '?column?'> =>
  new InternalDefaultExpression([
    new StringToken(`ANY`),
    new GroupToken([new ParameterToken(array)]),
  ]) as any;

export const now = (): Expression<Date, true, 'now'> =>
  new InternalExpression([new StringToken(`NOW()`)], 'now');

export const exists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new InternalDefaultExpression([new StringToken(`EXISTS`), new GroupToken(expression.toTokens())]);

export const andNotExists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new InternalDefaultExpression([
    new StringToken(`AND NOT EXISTS`),
    new GroupToken(expression.toTokens()),
  ]);

export const andExists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new InternalDefaultExpression([
    new StringToken(`AND EXISTS`),
    new GroupToken(expression.toTokens()),
  ]);

export const notExists = (
  expression: Expression<any, any, any> | Query<any>,
): DefaultExpression<boolean> =>
  new InternalDefaultExpression([
    new StringToken(`NOT EXISTS`),
    new GroupToken(expression.toTokens()),
  ]);

// TODO: it's still possible for coalesce to return nullable. It depends on the input.
export const coalesce = <DataType>(
  ...expressions: (Expression<DataType, boolean, any> | GetResultType<DataType>)[]
): Expression<DataType, true, 'coalesce'> => {
  return new InternalExpression(
    [
      new StringToken(`coalesce`),
      new GroupToken([
        new SeparatorToken(
          ',',
          expressions.map((expression) =>
            expression instanceof InternalExpression
              ? new CollectionToken(expression.toTokens())
              : new ParameterToken(expression),
          ),
        ),
      ]),
    ],
    'coalesce',
  ) as any;
};

export const cast = <T extends Any, IsNotNull extends boolean, Name extends string>(
  expression: Expression<any, IsNotNull, Name>,
  dataType: ToPostgresDataType<T>,
): Expression<T, IsNotNull, Name> =>
  new InternalExpression(
    [
      new StringToken(`CAST`),
      new GroupToken([
        ...expression.toTokens(),
        new StringToken(`AS`),
        new ParameterToken(dataType),
      ]),
    ],
    expression.getName(),
  ) as any;

export function toSql(query: Query<any>) {
  const queryState = createQueryState(query.toTokens());

  return {
    text: queryState.text.join(` `),
    parameters: queryState.parameters,
  };
}
