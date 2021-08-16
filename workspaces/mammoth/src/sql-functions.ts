import {
  AllStarToken,
  CollectionToken,
  EmptyToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  TableStarToken,
  Token,
  createQueryState,
} from './tokens';
import { Any, AnyNumber, Int4, Int8, Text, ToPostgresDataType } from './data-types';
import {
  AnyExpression,
  DefaultExpression,
  Expression,
  InternalDefaultExpression,
  InternalExpression,
  RawExpression,
} from './expression';
import { AnyTable, Table } from './TableType';
import type { Column, ColumnSet } from './column';
import { DbConfig, DefaultDbConfig, GetResultType } from './config';
import { Err, GetDataType } from './types';

import { Query } from './query';

interface Tokenable {
  toTokens(): Token[];
}

const isTokenable = (value: any): value is Tokenable =>
  value && typeof value === 'object' && 'toTokens' in value;

export class Star {
  private _starBrand: any;

  constructor(private readonly table?: AnyTable) {}

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

export const now = <Config extends DbConfig = DefaultDbConfig>(): Expression<
  Config,
  Date,
  true,
  'now'
> => new InternalExpression([new StringToken(`NOW()`)], 'now') as any;

export function raw<
  DataType,
  IsNotNull extends boolean = false,
  Name extends string = '?column?',
  Config extends DbConfig = DefaultDbConfig,
>(
  strings: TemplateStringsArray,
  ...parameters: any[]
): Expression<Config, DataType, IsNotNull, Name> {
  const tokens = strings.flatMap((string, index) => {
    if (index === strings.length - 1) {
      return [new StringToken(string)];
    }

    const parameter = parameters[index];
    return [new StringToken(string), new ParameterToken(parameter)];
  });

  return new InternalExpression(tokens, '' as any) as any;
}

export const count = <Config extends DbConfig = DefaultDbConfig>(
  expression?: AnyExpression,
): Expression<Config, Int8, true, 'count'> => {
  if (!expression) {
    return new InternalExpression([new StringToken(`COUNT(*)`)], 'count');
  }

  const tokens = expression.toTokens();

  return new InternalExpression([new StringToken(`COUNT`), new GroupToken(tokens)], 'count');
};

export function star(): Star;
export function star<T extends AnyTable>(
  table: T,
): T extends Table<any, any, infer Columns> ? ColumnSet<Columns> : never;
export function star(table?: AnyTable) {
  if (table) {
    return new Star(table) as any;
  }

  return new Star();
}

export const stringAgg = <Config extends DbConfig>(
  expression: Expression<Config, Text, boolean, any>,
  delimiter: string,
  ...orderBy: AnyExpression[]
): Expression<Config, Text, false, 'stringAgg'> => {
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

export const bitAnd = <Config extends DbConfig, T extends AnyNumber>(
  expression: Expression<Config, T, boolean, any>,
): Expression<Config, T, false, 'bitAnd'> =>
  new InternalExpression(
    [new StringToken(`bit_and`), new GroupToken(expression.toTokens(false))],
    'bitAnd',
  ) as any;

export const bitOr = <Config extends DbConfig, T extends AnyNumber>(
  expression: Expression<Config, T, boolean, any>,
): Expression<Config, T, false, 'bitOr'> =>
  new InternalExpression<Config, T, false, 'bitOr'>(
    [new StringToken(`bit_or`), new GroupToken(expression.toTokens(false))],
    'bitOr',
  ) as any;

export const boolAnd = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, any>,
): Expression<Config, number, false, 'boolAnd'> =>
  new InternalExpression<Config, number, false, 'boolAnd'>(
    [new StringToken(`bool_and`), new GroupToken(expression.toTokens(false))],
    'boolAnd',
  );

export const boolOr = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, any>,
): Expression<Config, number, false, 'boolOr'> =>
  new InternalExpression<Config, number, false, 'boolOr'>(
    [new StringToken(`bool_or`), new GroupToken(expression.toTokens(false))],
    'boolOr',
  );

export const every = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, any>,
): Expression<Config, number, false, 'every'> =>
  new InternalExpression<Config, number, false, 'every'>(
    [new StringToken(`every`), new GroupToken(expression.toTokens(false))],
    'every',
  );

export const arrayAgg = <Config extends DbConfig, DataType>(
  expression: Expression<Config, DataType, boolean, any>,
): Expression<Config, GetResultType<Config, DataType>[], false, 'arrayAgg'> =>
  new InternalExpression(
    [new StringToken(`array_agg`), new GroupToken(expression.toTokens(false))],
    'arrayAgg',
  ) as any;

export const min = <Config extends DbConfig, DataType>(
  expression: Expression<Config, DataType, boolean, any>,
): Expression<Config, DataType, false, 'min'> =>
  new InternalExpression<Config, DataType, false, 'min'>(
    [new StringToken(`MIN`), new GroupToken(expression.toTokens())],
    'min',
  ) as any;

export const max = <Config extends DbConfig, DataType>(
  expression: Expression<Config, DataType, boolean, any>,
): Expression<Config, DataType, false, 'max'> =>
  new InternalExpression(
    [new StringToken(`MAX`), new GroupToken(expression.toTokens())],
    'max',
  ) as any;

export const avg = <Config extends DbConfig, T extends AnyNumber>(
  expression: Expression<Config, T, boolean, any>,
): Expression<Config, T, false, 'avg'> =>
  new InternalExpression(
    [new StringToken(`AVG`), new GroupToken(expression.toTokens())],
    'avg',
  ) as any;

// Selecting the sum of an int4 results in a int8, but selecting the sum of any other data type
// doesn't seem to change the return type at all.
export const sum = <Config extends DbConfig, T>(
  expression: Expression<Config, T, boolean, any> | Column<Config, any, any, T, any, any, any>,
): Expression<Config, T extends Int4 ? Int8 : T, false, 'sum'> =>
  new InternalExpression(
    [new StringToken(`SUM`), new GroupToken(expression.toTokens())],
    'sum',
  ) as any;

export const xmlagg = <Config extends DbConfig, DataType>(
  expression: Expression<Config, DataType, boolean, any>,
): Expression<Config, number, false, 'xmlagg'> =>
  new InternalExpression<Config, number, false, 'xmlagg'>(
    [new StringToken(`xmlagg`), new GroupToken(expression.toTokens())],
    'xmlagg',
  );

export const not = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, string>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([
    new StringToken(`NOT`),
    new GroupToken(expression.toTokens()),
  ]) as any;

export const and = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, string>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([
    new StringToken(`AND`),
    new GroupToken(expression.toTokens()),
  ]) as any;

export const or = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, string>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([
    new StringToken(`OR`),
    new GroupToken(expression.toTokens()),
  ]) as any;

export const group = <Config extends DbConfig>(
  expression: Expression<Config, boolean, boolean, string>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([new GroupToken(expression.toTokens())]) as any;

export const any = <Config extends DbConfig, T>(
  array: T[],
): RawExpression<Config, T, true, '?column?'> =>
  new InternalDefaultExpression([
    new StringToken(`ANY`),
    new GroupToken([new ParameterToken(array)]),
  ]) as any;

export const exists = <Config extends DbConfig>(
  expression: AnyExpression | Query<any>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([new StringToken(`EXISTS`), new GroupToken(expression.toTokens())]);

export const andNotExists = <Config extends DbConfig>(
  expression: Expression<Config, any, any, any> | Query<any>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([
    new StringToken(`AND NOT EXISTS`),
    new GroupToken(expression.toTokens()),
  ]);

export const andExists = <Config extends DbConfig>(
  expression: Expression<Config, any, any, any> | Query<any>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([
    new StringToken(`AND EXISTS`),
    new GroupToken(expression.toTokens()),
  ]);

export const notExists = <Config extends DbConfig>(
  expression: Expression<Config, any, any, any> | Query<any>,
): DefaultExpression<Config, boolean> =>
  new InternalDefaultExpression([
    new StringToken(`NOT EXISTS`),
    new GroupToken(expression.toTokens()),
  ]);

export function nullIf<Config extends DbConfig, DataType>(
  value1: Expression<Config, DataType, any, any>,
  value2: Expression<any, DataType, any, any> | GetResultType<Config, DataType>,
): Expression<Config, DataType, false, 'nullif'> {
  return new InternalExpression(
    [
      new StringToken(`nullif`),
      new GroupToken([
        new SeparatorToken(',', [
          new CollectionToken(value1.toTokens()),
          isTokenable(value2) ? new CollectionToken(value2.toTokens()) : new ParameterToken(value2),
        ]),
      ]),
    ],
    'nullif',
  ) as any;
}

export function greatest<Config extends DbConfig, DataType>(
  first: Expression<Config, DataType, any, any>,
  ...rest: (Expression<any, DataType, any, any> | GetResultType<Config, DataType>)[]
): Expression<Config, DataType, false, 'greatest'> {
  return new InternalExpression(
    [
      new StringToken(`greatest`),
      new GroupToken([
        new SeparatorToken(
          ',',
          [first, ...rest].map((val) =>
            isTokenable(val) ? new CollectionToken(val.toTokens()) : new ParameterToken(val),
          ),
        ),
      ]),
    ],
    'greatest',
  ) as any;
}

export function least<Config extends DbConfig, DataType>(
  first: Expression<Config, DataType, any, any>,
  ...rest: (Expression<any, DataType, any, any> | GetResultType<Config, DataType>)[]
): Expression<Config, DataType, false, 'least'> {
  return new InternalExpression(
    [
      new StringToken(`least`),
      new GroupToken([
        new SeparatorToken(
          ',',
          [first, ...rest].map((val) =>
            isTokenable(val) ? new CollectionToken(val.toTokens()) : new ParameterToken(val),
          ),
        ),
      ]),
    ],
    'least',
  ) as any;
}

// At some point this needs to be extended, because only columns and literal types are supported.
// The type system kept complaining when using Expression<..> directly and passing in columns.
export function coalesce<C extends Column<any, any, any, any, any, any, any>>(
  expression: C,
  expression2: C,
): Expression<
  any,
  C extends Column<any, any, any, infer DataType, any, any, any>
    ? DataType
    : Err<'could not find column data type'>,
  C extends Column<any, any, any, any, infer IsNotNull, any, any> ? IsNotNull & true : false,
  'coalesce'
>;
export function coalesce<
  C extends Column<any, any, any, any, any, any, any>,
  D extends C extends Column<infer Config, any, any, infer DataType, any, any, any>
    ? GetResultType<Config, DataType> | GetResultType<Config, 'Null'>
    : Err<'could not find column data type'>,
>(
  expression: C,
  expression2: D,
): Expression<
  any,
  C extends Column<any, any, any, infer DataType, any, any, any>
    ? DataType
    : Err<'could not find column data type'>,
  C extends Column<infer Config, any, any, any, any, any, any>
    ? [D] extends [GetResultType<Config, 'Null'>]
      ? [GetResultType<Config, 'Null'>] extends [D]
        ? false
        : true
      : true
    : false,
  'coalesce'
>;
export function coalesce(...expressions: any[]) {
  return new InternalExpression(
    [
      new StringToken(`coalesce`),
      new GroupToken([
        new SeparatorToken(
          ',',
          expressions.map((expression) =>
            isTokenable(expression)
              ? new CollectionToken(expression.toTokens())
              : new ParameterToken(expression),
          ),
        ),
      ]),
    ],
    'coalesce',
  ) as any;
}

export const cast = <
  Config extends DbConfig,
  T extends Any,
  IsNotNull extends boolean,
  Name extends string,
>(
  expression: Expression<Config, any, IsNotNull, Name>,
  dataType: ToPostgresDataType<T>,
): Expression<Config, T, IsNotNull, Name> =>
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

export function toSql(query: Query<any> | { toTokens: () => Token[] }) {
  const queryState = createQueryState(query.toTokens());

  return {
    text: queryState.text.join(` `),
    parameters: queryState.parameters,
  };
}
