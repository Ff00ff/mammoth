import { BooleanQuery, Query, SpecificQuery } from './query';
import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
} from './tokens';

export class Expression<DataType, IsNotNull extends boolean, Name extends string> {
  private _expressionBrand: any;

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

  private getDataTypeTokens(value: DataType | Expression<DataType, true, any> | Query<any>) {
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

  private toGroup(expression: Expression<any, any, any> | Query<any>) {
    const newTokens = expression.toTokens();

    // Anything above 3 means we need to start grouping this in ( and ).
    if (newTokens.length > 3) {
      return new GroupToken(newTokens);
    }

    return new CollectionToken(newTokens);
  }

  // TODO: only include
  // or: DataType extends boolean
  //   ? (expression: Expression<boolean, boolean, string>) => void
  //   : Explain<
  //       'Expression#or() is only available on boolean expressions. Is this a boolean expression?'
  //     > = (() => {
  //   //
  // }) as any;
  or<Q extends Query<any>>(
    expression: Expression<boolean, any, any> | BooleanQuery<Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([...this.tokens, new StringToken(`OR`), this.toGroup(expression)]);
  }

  and<Q extends Query<any>>(
    expression: Expression<boolean, any, any> | BooleanQuery<Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`AND`),
      this.toGroup(expression),
    ]);
  }

  andNotExists(expression: Expression<any, any, any> | Query<any>): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`AND NOT EXISTS`),
      this.toGroup(expression),
    ]);
  }

  andExists(expression: Expression<any, any, any> | Query<any>): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`AND EXISTS`),
      this.toGroup(expression),
    ]);
  }

  as<AliasName extends string>(name: AliasName): Expression<DataType, IsNotNull, AliasName> {
    if (this.tokens.length > 2) {
      return new Expression([new GroupToken(this.tokens)], name, true);
    }

    return new Expression([...this.tokens], name, true);
  }

  isNull(): DefaultExpression<boolean> {
    return new DefaultExpression([...this.tokens, new StringToken(`IS NULL`)]);
  }

  isNotNull(): DefaultExpression<boolean> {
    return new DefaultExpression([...this.tokens, new StringToken(`IS NOT NULL`)]);
  }

  asc(): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([...this.tokens, new StringToken(`ASC`)]);
  }

  desc(): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([...this.tokens, new StringToken(`DESC`)]);
  }

  nullsFirst(): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([...this.tokens, new StringToken(`NULLS FIRST`)]);
  }

  nullsLast(): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([...this.tokens, new StringToken(`NULLS LAST`)]);
  }

  in<Q extends Query<any>>(
    array: DataType[] | Expression<DataType, IsNotNull, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    if (array && ('toTokens' in array || array instanceof Query)) {
      return new DefaultExpression([
        ...this.tokens,
        new StringToken(`IN`),
        new GroupToken(array.toTokens()),
      ]);
    } else {
      return new DefaultExpression([
        ...this.tokens,
        new StringToken(`IN`),
        new GroupToken([
          new SeparatorToken(
            ',',
            array.map((item) => new ParameterToken(item)),
          ),
        ]),
      ]);
    }
  }

  notIn(
    array: DataType[] | Expression<DataType, IsNotNull, any> | Query<any>,
  ): DefaultExpression<boolean> {
    if (array && ('toTokens' in array || array instanceof Query)) {
      return new DefaultExpression([
        ...this.tokens,
        new StringToken(`NOT IN`),
        new GroupToken(array.toTokens()),
      ]);
    } else {
      return new DefaultExpression([
        ...this.tokens,
        new StringToken(`NOT IN`),
        new GroupToken([
          new SeparatorToken(
            ',',
            array.map((item) => new ParameterToken(item)),
          ),
        ]),
      ]);
    }
  }

  plus(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`+`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  minus(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`-`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  multiply(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`*`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  divide(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`/`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  modulo(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`%`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  concat(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`||`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  between(a: DataType, b: DataType): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`BETWEEN`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  betweenSymmetric(a: DataType, b: DataType): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`BETWEEN SYMMETRIC`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  isDistinctFrom(a: DataType): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`IS DISTINCT FROM`),
      new ParameterToken(a),
    ]);
  }

  isNotDistinctFrom(a: DataType): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`IS NOT DISTINCT FROM`),
      new ParameterToken(a),
    ]);
  }

  like(value: DataType): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`LIKE`),
      new ParameterToken(value),
    ]);
  }

  ilike(value: DataType): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`ILIKE`),
      new ParameterToken(value),
    ]);
  }

  eq<Q extends Query<any>>(
    value: DataType | Expression<DataType, boolean, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  ne<Q extends Query<any>>(
    value: DataType | Expression<DataType, boolean, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`<>`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  gt<Q extends Query<any>>(
    value: DataType | Expression<DataType, boolean, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`>`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  gte<Q extends Query<any>>(
    value: DataType | Expression<DataType, boolean, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`>=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  lt<Q extends Query<any>>(
    value: DataType | Expression<DataType, boolean, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`<`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  lte<Q extends Query<any>>(
    value: DataType | Expression<DataType, boolean, any> | SpecificQuery<DataType, Q>,
  ): DefaultExpression<boolean> {
    return new DefaultExpression([
      ...this.tokens,
      new StringToken(`<=`),
      ...this.getDataTypeTokens(value),
    ]);
  }

  orderBy(...expressions: Expression<any, any, any>[]): DefaultExpression<DataType, IsNotNull> {
    return new DefaultExpression<DataType, IsNotNull>([
      ...this.tokens,
      new StringToken(`ORDER BY`),
      new SeparatorToken(
        ',',
        expressions.map((expression) => new CollectionToken(expression.toTokens())),
      ),
    ]);
  }

  /** @internal */
  toTokens(includeAlias?: boolean) {
    if (includeAlias && (this.nameIsAlias || this.name.match(/[A-Z]/))) {
      // Some expression return a train_case name by default such as string_agg. We automatically
      // convert these to camelCase equivalents e.g. stringAgg.
      return [...this.tokens, new StringToken(`"${this.name}"`)];
    }

    return this.tokens;
  }
}

export class DefaultExpression<DataType, IsNotNull extends boolean = true> extends Expression<
  DataType,
  IsNotNull,
  '?column?'
> {
  constructor(tokens: Token[]) {
    super(tokens, '?column?');
  }
}
