import { AnyNumber, GetMostSignificantDataType, GetNotNull, Int4, Int8, Text } from './data-types';
import { BooleanQuery, Query, SpecificQuery } from './query';
import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
} from './tokens';

import { GetResultType } from './config';
import { wrapQuotes } from './naming';

export interface SharedExpression<DataType, IsNotNull extends boolean, Name extends string> {
  /** @internal */
  toTokens(includeAlias?: boolean): Token[];

  /** @internal */
  getName(): string;

  as<AliasName extends string>(name: AliasName): Expression<DataType, IsNotNull, AliasName>;

  isNull(): DefaultExpression<boolean>;
  isNotNull(): DefaultExpression<boolean>;

  isDistinctFrom(a: DataType): DefaultExpression<boolean>;
  isNotDistinctFrom(a: DataType): DefaultExpression<boolean>;

  eq<RightNotNull extends boolean>(
    value: Expression<DataType, RightNotNull, any>,
  ): DefaultExpression<boolean, GetNotNull<IsNotNull, RightNotNull>>;
  eq<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<GetResultType<DataType>, boolean, any>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean>;
  ne<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean>;
  gt<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean>;
  gte<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean>;
  lt<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean>;
  lte<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean>;
  orderBy(...expressions: Expression<any, any, any>[]): DefaultExpression<DataType, IsNotNull>;

  // TODO
  asc(): DefaultExpression<DataType, IsNotNull>;
  desc(): DefaultExpression<DataType, IsNotNull>;
  nullsFirst(): DefaultExpression<DataType, IsNotNull>;
  nullsLast(): DefaultExpression<DataType, IsNotNull>;
  in<Q extends Query<any>>(
    array:
      | SpecificQuery<DataType, Q>
      | GetResultType<DataType>[]
      | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<boolean>;
  notIn(
    array: GetResultType<DataType>[] | Expression<DataType, IsNotNull, any> | Query<any>,
  ): DefaultExpression<boolean>;
}
export interface TextExpression<DataType, IsNotNull extends boolean, Name extends string>
  extends SharedExpression<DataType, IsNotNull, Name> {
  concat<RightIsNotNull extends boolean>(
    value: GetResultType<DataType> | Expression<DataType, RightIsNotNull, any>,
  ): DefaultExpression<DataType, GetNotNull<IsNotNull, RightIsNotNull>>;
  like(value: GetResultType<DataType>): DefaultExpression<boolean>;
  ilike(value: GetResultType<DataType>): DefaultExpression<boolean>;
}
export interface NumberExpression<DataType, IsNotNull extends boolean, Name extends string>
  extends SharedExpression<DataType, IsNotNull, Name> {
  plus<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<T, RightIsNotNull, any>,
  ): DefaultExpression<
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  plus(value: GetResultType<AnyNumber>): DefaultExpression<DataType, IsNotNull>;

  minus<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<T, RightIsNotNull, any>,
  ): DefaultExpression<
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  minus<T extends AnyNumber>(
    value: GetResultType<T>,
  ): DefaultExpression<GetMostSignificantDataType<DataType, T>, IsNotNull>;

  multiply<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<T, RightIsNotNull, any>,
  ): DefaultExpression<
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  multiply<T extends AnyNumber>(
    value: GetResultType<T>,
  ): DefaultExpression<GetMostSignificantDataType<DataType, T>, IsNotNull>;

  divide<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<T, RightIsNotNull, any>,
  ): DefaultExpression<
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  divide<T extends AnyNumber>(
    value: GetResultType<T>,
  ): DefaultExpression<GetMostSignificantDataType<DataType, T>, IsNotNull>;

  // TODO: these should only be available on integers
  modulo<T extends AnyNumber, RightIsNotNull extends boolean>(
    expression: Expression<T, RightIsNotNull, any>,
  ): DefaultExpression<
    GetMostSignificantDataType<DataType, T>,
    GetNotNull<IsNotNull, RightIsNotNull>
  >;
  modulo<T extends AnyNumber>(
    value: GetResultType<T>,
  ): DefaultExpression<GetMostSignificantDataType<DataType, T>, IsNotNull>;

  between(a: GetResultType<DataType>, b: GetResultType<DataType>): DefaultExpression<boolean>;
  betweenSymmetric(
    a: GetResultType<DataType>,
    b: GetResultType<DataType>,
  ): DefaultExpression<boolean>;
}
export interface BooleanExpression<DataType, IsNotNull extends boolean, Name extends string> {
  /** @internal */
  toTokens(includeAlias?: boolean): Token[];

  /** @internal */
  getName(): string;

  as<AliasName extends string>(name: AliasName): Expression<DataType, IsNotNull, AliasName>;

  or(query: BooleanQuery<Query<any>>): DefaultExpression<boolean, IsNotNull>;
  or<RightIsNotNull extends boolean>(
    expression: Expression<boolean, RightIsNotNull, any>,
  ): DefaultExpression<boolean, GetNotNull<IsNotNull, RightIsNotNull>>;

  and(query: BooleanQuery<Query<any>>): DefaultExpression<boolean, IsNotNull>;
  and<RightIsNotNull extends boolean>(
    expression: Expression<boolean, RightIsNotNull, any>,
  ): DefaultExpression<boolean, GetNotNull<IsNotNull, RightIsNotNull>>;

  andNotExists(query: Query<any>): DefaultExpression<boolean, IsNotNull>;
  andNotExists<RightIsNotNull extends boolean>(
    expression: Expression<boolean, RightIsNotNull, any>,
  ): DefaultExpression<boolean, GetNotNull<IsNotNull, RightIsNotNull>>;

  andExists(query: Query<any>): DefaultExpression<boolean, IsNotNull>;
  andExists<RightIsNotNull extends boolean>(
    expression: Expression<boolean, RightIsNotNull, any>,
  ): DefaultExpression<boolean, GetNotNull<IsNotNull, RightIsNotNull>>;
}

// This is used when the data type is not one of the default types. In that case we fall back to
// include all expression functions.
export interface RawExpression<DataType, IsNotNull extends boolean, Name extends string>
  extends TextExpression<DataType, IsNotNull, Name>,
    NumberExpression<DataType, IsNotNull, Name> {}

export type Expression<
  DataType,
  IsNotNull extends boolean,
  Name extends string,
> = DataType extends boolean
  ? BooleanExpression<DataType, IsNotNull, Name>
  : DataType extends AnyNumber
  ? NumberExpression<DataType, IsNotNull, Name>
  : DataType extends Text
  ? TextExpression<DataType, IsNotNull, Name>
  : DataType extends number
  ? NumberExpression<DataType, IsNotNull, Name>
  : DataType extends string
  ? TextExpression<DataType, IsNotNull, Name>
  : RawExpression<DataType, IsNotNull, Name>;

export class InternalExpression<DataType, IsNotNull extends boolean, Name extends string>
  implements
    TextExpression<DataType, IsNotNull, Name>,
    NumberExpression<DataType, IsNotNull, Name>,
    BooleanExpression<DataType, IsNotNull, Name>
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
    value: GetResultType<DataType> | Expression<DataType, boolean, any> | Query<any>,
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

  or(expression: Expression<boolean, any, any> | BooleanQuery<Query<any>>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`OR`),
      this.toGroup(expression),
    ]) as any;
  }

  and(expression: Expression<boolean, any, any> | BooleanQuery<Query<any>>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`AND`),
      this.toGroup(expression),
    ]) as any;
  }

  andNotExists(expression: Expression<any, any, any> | Query<any>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`AND NOT EXISTS`),
      this.toGroup(expression),
    ]) as any;
  }

  andExists(expression: Expression<any, any, any> | Query<any>) {
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

  between(a: GetResultType<DataType>, b: GetResultType<DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`BETWEEN`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  betweenSymmetric(a: GetResultType<DataType>, b: GetResultType<DataType>) {
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

  like(value: GetResultType<DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`LIKE`),
      new ParameterToken(value),
    ]);
  }

  ilike(value: GetResultType<DataType>) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`ILIKE`),
      new ParameterToken(value),
    ]);
  }

  eq<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  ne<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`<>`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  gt<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`>`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  gte<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`>=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  lt<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`<`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  lte<Q extends Query<any>>(
    value:
      | GetResultType<DataType>
      | Expression<DataType, boolean, any>
      | SpecificQuery<DataType, Q>,
  ) {
    return new InternalDefaultExpression([
      ...this.tokens,
      new StringToken(`<=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  orderBy(...expressions: any[]) {
    return new InternalDefaultExpression<DataType, IsNotNull>([
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

export type DefaultExpression<DataType, IsNotNull extends boolean = true> = Expression<
  DataType,
  IsNotNull,
  '?column?'
>;

export class InternalDefaultExpression<
  DataType,
  IsNotNull extends boolean = true,
> extends InternalExpression<DataType, IsNotNull, '?column?'> {
  constructor(tokens: Token[]) {
    super(tokens, '?column?');
  }
}
