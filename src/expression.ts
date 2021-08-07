import {
  AnyNumber,
  GetMostSignificantDataType,
  GetNotNull,
  Int4,
  Int8,
  Text,
  Uuid,
} from './data-types';
import { BooleanQuery, Query, SpecificQuery } from './query';
import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
} from './tokens';
import { DbConfig, GetResultType } from './config';

import { wrapQuotes } from './naming';
import { Column } from './column';
import { Err, GetDataType } from './types';
import { TableDefinition } from './table';

export interface SharedExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> {
  /** @internal */
  toTokens(includeAlias?: boolean): Token[];

  /** @internal */
  getName(): string;

  as<AliasName extends string>(name: AliasName): Expression<Config, DataType, IsNotNull, AliasName>;

  isNull(): DefaultExpression<Config, boolean>;
  isNotNull(): DefaultExpression<Config, boolean>;

  isDistinctFrom(a: DataType): DefaultExpression<Config, boolean>;
  isNotDistinctFrom(a: DataType): DefaultExpression<Config, boolean>;

  eq<RightNotNull extends boolean>(
    value: Expression<Config, DataType, RightNotNull, any>,
  ): DefaultExpression<Config, boolean, GetNotNull<IsNotNull, RightNotNull>>;
  eq<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, GetResultType<Config, DataType>, boolean, any>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ): DefaultExpression<Config, boolean>;
  ne<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ): DefaultExpression<Config, boolean>;
  gt<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ): DefaultExpression<Config, boolean>;
  gte<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ): DefaultExpression<Config, boolean>;
  lt<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ): DefaultExpression<Config, boolean>;
  lte<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ): DefaultExpression<Config, boolean>;
  orderBy(
    ...expressions: Expression<any, any, any, any>[]
  ): DefaultExpression<Config, DataType, IsNotNull>;

  // TODO
  asc(): DefaultExpression<Config, DataType, IsNotNull>;
  desc(): DefaultExpression<Config, DataType, IsNotNull>;
  nullsFirst(): DefaultExpression<Config, DataType, IsNotNull>;
  nullsLast(): DefaultExpression<Config, DataType, IsNotNull>;
  in<Q extends Query<any>>(
    array:
      | SpecificQuery<Config, DataType, Q>
      | GetResultType<Config, DataType>[]
      | Expression<Config, DataType, IsNotNull, any>,
  ): DefaultExpression<Config, boolean>;
  notIn(
    array:
      | GetResultType<Config, DataType>[]
      | Expression<Config, DataType, IsNotNull, any>
      | Query<any>,
  ): DefaultExpression<Config, boolean>;
}
export interface TextExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> extends SharedExpression<Config, DataType, IsNotNull, Name> {
  concat<RightIsNotNull extends boolean>(
    value: GetResultType<Config, DataType> | Expression<Config, DataType, RightIsNotNull, any>,
  ): DefaultExpression<Config, DataType, GetNotNull<IsNotNull, RightIsNotNull>>;
  like(value: GetResultType<Config, DataType>): DefaultExpression<Config, boolean>;
  ilike(value: GetResultType<Config, DataType>): DefaultExpression<Config, boolean>;
}
export interface NumberExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> extends SharedExpression<Config, DataType, IsNotNull, Name> {
  plus<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<Config, T, RightIsNotNull, any>,
  ): DefaultExpression<
    Config,
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  plus(value: GetResultType<Config, AnyNumber>): DefaultExpression<Config, DataType, IsNotNull>;

  minus<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<Config, T, RightIsNotNull, any>,
  ): DefaultExpression<
    Config,
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  minus<T extends AnyNumber>(
    value: GetResultType<Config, T>,
  ): DefaultExpression<Config, GetMostSignificantDataType<DataType, T>, IsNotNull>;

  multiply<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<Config, T, RightIsNotNull, any>,
  ): DefaultExpression<
    Config,
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  multiply<T extends AnyNumber>(
    value: GetResultType<Config, T>,
  ): DefaultExpression<Config, GetMostSignificantDataType<DataType, T>, IsNotNull>;

  divide<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<Config, T, RightIsNotNull, any>,
  ): DefaultExpression<
    Config,
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  divide<T extends AnyNumber>(
    value: GetResultType<Config, T>,
  ): DefaultExpression<Config, GetMostSignificantDataType<DataType, T>, IsNotNull>;

  // TODO: these should only be available on integers
  modulo<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<Config, T, RightIsNotNull, any>,
  ): DefaultExpression<
    Config,
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  modulo<T extends AnyNumber>(
    value: GetResultType<Config, T>,
  ): DefaultExpression<Config, GetMostSignificantDataType<DataType, T>, IsNotNull>;

  between(
    a: GetResultType<Config, DataType>,
    b: GetResultType<Config, DataType>,
  ): DefaultExpression<Config, boolean>;
  betweenSymmetric(
    a: GetResultType<Config, DataType>,
    b: GetResultType<Config, DataType>,
  ): DefaultExpression<Config, boolean>;
}
export interface BooleanExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> {
  /** @internal */
  toTokens(includeAlias?: boolean): Token[];

  /** @internal */
  getName(): string;

  as<AliasName extends string>(name: AliasName): Expression<Config, DataType, IsNotNull, AliasName>;

  or(query: BooleanQuery<Config, Query<any>>): DefaultExpression<Config, boolean, IsNotNull>;
  or<RightIsNotNull extends boolean>(
    expression: Expression<Config, boolean, RightIsNotNull, any>,
  ): DefaultExpression<Config, boolean, GetNotNull<IsNotNull, RightIsNotNull>>;

  and(query: BooleanQuery<Config, Query<any>>): DefaultExpression<Config, boolean, IsNotNull>;
  and<RightIsNotNull extends boolean>(
    expression: Expression<Config, boolean, RightIsNotNull, any>,
  ): DefaultExpression<Config, boolean, GetNotNull<IsNotNull, RightIsNotNull>>;

  andNotExists(query: Query<any>): DefaultExpression<Config, boolean, IsNotNull>;
  andNotExists<RightIsNotNull extends boolean>(
    expression: Expression<Config, boolean, RightIsNotNull, any>,
  ): DefaultExpression<Config, boolean, GetNotNull<IsNotNull, RightIsNotNull>>;

  andExists(query: Query<any>): DefaultExpression<Config, boolean, IsNotNull>;
  andExists<RightIsNotNull extends boolean>(
    expression: Expression<Config, boolean, RightIsNotNull, any>,
  ): DefaultExpression<Config, boolean, GetNotNull<IsNotNull, RightIsNotNull>>;
}

// This is used when the data type is not one of the default types. In that case we fall back to
// include all expression functions.
export interface RawExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> extends TextExpression<Config, DataType, IsNotNull, Name>,
    NumberExpression<Config, DataType, IsNotNull, Name> {}

export interface UuidExpression<
  Config extends DbConfig,
  TD,
  IsNotNull extends boolean,
  Name extends string,
> extends Omit<SharedExpression<Config, Uuid<TD>, IsNotNull, Name>, 'eq'> {
  eq(value: GetResultType<Config, Uuid<TD>>): DefaultExpression<Config, boolean, IsNotNull>;
  eq<RightExpression extends UuidExpression<Config, any, any, any>>(
    expression: RightExpression,
  ): RightExpression extends UuidExpression<
    Config,
    infer RightTableDefinition,
    infer RightIsNotNull,
    any
  >
    ? RightTableDefinition extends TableDefinition<infer RightColumns>
      ? TD extends TableDefinition<infer LeftColumns>
        ? [LeftColumns] extends [RightColumns]
          ? [RightColumns] extends [LeftColumns]
            ? DefaultExpression<Config, boolean, GetNotNull<IsNotNull, RightIsNotNull>>
            : Err<'not the right references'>
          : Err<'not the right references'>
        : Err<'no left table definition found in uuid'>
      : Err<'no right table definition found in uuid'>
    : Err<'no uuid expression'>;
}

export type Expression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> = DataType extends boolean
  ? BooleanExpression<Config, DataType, IsNotNull, Name>
  : DataType extends AnyNumber
  ? NumberExpression<Config, DataType, IsNotNull, Name>
  : DataType extends Text
  ? TextExpression<Config, DataType, IsNotNull, Name>
  : DataType extends number
  ? NumberExpression<Config, DataType, IsNotNull, Name>
  : DataType extends string
  ? TextExpression<Config, DataType, IsNotNull, Name>
  : DataType extends Uuid<infer TableDefinition>
  ? UuidExpression<Config, TableDefinition, IsNotNull, Name>
  : RawExpression<Config, DataType, IsNotNull, Name>;

export class InternalExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> implements
    TextExpression<Config, DataType, IsNotNull, Name>,
    NumberExpression<Config, DataType, IsNotNull, Name>,
    BooleanExpression<Config, DataType, IsNotNull, Name>
{
  private _expressionBrand!: ['expression', DataType, IsNotNull, Name];

  /** @internal */
  getName() {
    return this.name;
  }

  // To avoid Name becoming any, it seems we have to use it somewhere. Because we strip internal
  // calls to avoid poluting the public api, we just add a protected function which keeps Name
  // intact and doesn't pollute the api.
  protected unusedName() {
    return this.name;
  }

  constructor(
    private readonly tokens: Token[],
    private readonly name: Name,
    private readonly nameIsAlias = false,
  ) {}

  private getDataTypeTokens(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | Query<any>,
  ) {
    if (
      value &&
      typeof value === `object` &&
      'toTokens' in value &&
      typeof value.toTokens === `function`
    ) {
      if (value instanceof Query) {
        return [new GroupToken(value.toTokens())];
      }

      return value.toTokens();
    }

    return [new ParameterToken(value)];
  }

  private toGroup(expression: any) {
    const newTokens = expression.toTokens();

    // Anything above 3 means we need to start grouping this in ( and ).
    if (newTokens.length > 3) {
      return new GroupToken(newTokens);
    }

    return new CollectionToken(newTokens);
  }

  or(expression: Expression<any, boolean, any, any> | BooleanQuery<Config, Query<any>>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`OR`),
      this.toGroup(expression),
    ]) as any;
  }

  and(expression: Expression<any, boolean, any, any> | BooleanQuery<Config, Query<any>>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`AND`),
      this.toGroup(expression),
    ]) as any;
  }

  andNotExists(expression: Expression<any, any, any, any> | Query<any>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`AND NOT EXISTS`),
      this.toGroup(expression),
    ]) as any;
  }

  andExists(expression: Expression<any, any, any, any> | Query<any>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`AND EXISTS`),
      this.toGroup(expression),
    ]) as any;
  }

  as(name: any) {
    if (this.tokens.length > 2) {
      return new InternalExpression([new GroupToken(this.tokens)], name, true) as any;
    }

    return new InternalExpression([...this.tokens], name, true);
  }

  isNull() {
    return new InternalDefaultExpression([...this.tokens, new StringToken(`IS NULL`)]) as any;
  }

  isNotNull() {
    return new InternalDefaultExpression([...this.tokens, new StringToken(`IS NOT NULL`)]) as any;
  }

  asc() {
    return new InternalDefaultExpression([...this.tokens, new StringToken(`ASC`)]) as any;
  }

  desc() {
    return new InternalDefaultExpression([...this.tokens, new StringToken(`DESC`)]) as any;
  }

  nullsFirst() {
    return new InternalDefaultExpression([...this.tokens, new StringToken(`NULLS FIRST`)]) as any;
  }

  nullsLast() {
    return new InternalDefaultExpression([...this.tokens, new StringToken(`NULLS LAST`)]) as any;
  }

  in(array: any) {
    if (array && ('toTokens' in array || array instanceof Query)) {
      return new InternalDefaultExpression([
        ...this.tokens,
        new StringToken(`IN`),
        new GroupToken(array.toTokens()),
      ]) as any;
    } else {
      return new InternalDefaultExpression([
        ...this.tokens,
        new StringToken(`IN`),
        new GroupToken([
          new SeparatorToken(
            ',',
            array.map((item: any) => new ParameterToken(item)),
          ),
        ]),
      ]) as any;
    }
  }

  notIn(array: any) {
    if (array && ('toTokens' in array || array instanceof Query)) {
      return new InternalDefaultExpression([
        ...this.tokens,
        new StringToken(`NOT IN`),
        new GroupToken(array.toTokens()),
      ]) as any;
    } else {
      return new InternalDefaultExpression([
        ...this.tokens,
        new StringToken(`NOT IN`),
        new GroupToken([
          new SeparatorToken(
            ',',
            array.map((item: any) => new ParameterToken(item)),
          ),
        ]),
      ]) as any;
    }
  }

  plus(value: any) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`+`),
      ...this.getDataTypeTokens(value),
    ]) as any;
  }

  minus(value: any) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`-`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  multiply(value: any) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`*`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  divide(value: any) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`/`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  modulo(value: any) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`%`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  concat(value: any) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`||`),
      ...this.getDataTypeTokens(value),
    ]) as any;
  }

  between(a: GetResultType<Config, DataType>, b: GetResultType<Config, DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`BETWEEN`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  betweenSymmetric(a: GetResultType<Config, DataType>, b: GetResultType<Config, DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`BETWEEN SYMMETRIC`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  isDistinctFrom(a: DataType) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`IS DISTINCT FROM`),
      new ParameterToken(a),
    ]);
  }

  isNotDistinctFrom(a: DataType) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`IS NOT DISTINCT FROM`),
      new ParameterToken(a),
    ]);
  }

  like(value: GetResultType<Config, DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`LIKE`),
      new ParameterToken(value),
    ]);
  }

  ilike(value: GetResultType<Config, DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`ILIKE`),
      new ParameterToken(value),
    ]);
  }

  eq<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  ne<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`<>`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  gt<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`>`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  gte<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`>=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  lt<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`<`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  lte<Q extends Query<any>>(
    value:
      | GetResultType<Config, DataType>
      | Expression<Config, DataType, boolean, any>
      | SpecificQuery<Config, DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`<=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  orderBy(...expressions: any[]) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`ORDER BY`),
      new SeparatorToken(
        ',',
        expressions.map((expression) => new CollectionToken(expression.toTokens())),
      ),
    ]) as any;
  }

  /** @internal */
  toTokens(includeAlias?: boolean) {
    if (includeAlias && (this.nameIsAlias || this.name.match(/[A-Z]/))) {
      // Some expression return a train_case name by default such as string_agg. We automatically
      // convert these to camelCase equivalents e.g. stringAgg.
      return [...this.tokens, new StringToken(`${wrapQuotes(this.name)}`)];
    }

    return this.tokens;
  }
}

export type DefaultExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean = true,
> = Expression<Config, DataType, IsNotNull, '?column?'>;

export class InternalDefaultExpression<
  Config extends DbConfig,
  DataType,
  IsNotNull extends boolean = true,
> extends InternalExpression<Config, DataType, IsNotNull, '?column?'> {
  constructor(tokens: Token[]) {
    super(tokens, '?column?');
  }
}

export type AnyExpression = Expression<any, any, any, any>;
