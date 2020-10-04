import { Condition, makeCondition } from './condition';
import { GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from './tokens';

import { Query } from './query';

export class Expression<DataType, IsNotNull extends boolean, Name extends string> {
  private _expressionBrand: any;

  /** @internal */
  getName() {
    return this.name;
  }

  constructor(private readonly tokens: Token[], private readonly name: Name) {}

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

  as<AliasName extends string>(name: AliasName) {
    if (this.tokens.length > 2) {
      return new Expression<DataType, IsNotNull, AliasName>(
        [new GroupToken(this.tokens), new StringToken(`"${name}"`)],
        name,
      );
    }

    return new Expression<DataType, IsNotNull, AliasName>(
      [...this.tokens, new StringToken(`"${name}"`)],
      name,
    );
  }

  isNull() {
    return makeCondition([...this.tokens, new StringToken(`IS NULL`)]);
  }

  isNotNull() {
    return makeCondition([...this.tokens, new StringToken(`IS NOT NULL`)]);
  }

  asc() {
    return new Expression([...this.tokens, new StringToken(`ASC`)], `?column?`);
  }

  desc() {
    return new Expression([...this.tokens, new StringToken(`DESC`)], `?column?`);
  }

  nullsFirst() {
    return new Expression([...this.tokens, new StringToken(`NULLS FIRST`)], `?column?`);
  }

  nullsLast() {
    return new Expression([...this.tokens, new StringToken(`NULLS LAST`)], `?column?`);
  }

  in(array: DataType[] | Expression<DataType, IsNotNull, any> | Query<any>) {
    if (array && ('toTokens' in array || array instanceof Query)) {
      return makeCondition([
        ...this.tokens,
        new StringToken(`IN`),
        new GroupToken(array.toTokens()),
      ]);
    } else {
      return makeCondition([
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

  notIn(array: DataType[] | Expression<DataType, IsNotNull, any> | Query<any>) {
    if (array && ('toTokens' in array || array instanceof Query)) {
      return makeCondition([
        ...this.tokens,
        new StringToken(`NOT IN`),
        new GroupToken(array.toTokens()),
      ]);
    } else {
      return makeCondition([
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
  ): Expression<DataType, IsNotNull, '?column?'> {
    return new Expression(
      [...this.tokens, new StringToken(`+`), ...this.getDataTypeTokens(value)],
      `?column?`,
    );
  }

  minus(
    value: DataType | Expression<DataType, IsNotNull, any>,
  ): Expression<DataType, IsNotNull, '?column?'> {
    return new Expression(
      [...this.tokens, new StringToken(`-`), ...this.getDataTypeTokens(value)],
      `?column?`,
    );
  }

  multiply(value: DataType | Expression<DataType, IsNotNull, any>) {
    return new Expression(
      [...this.tokens, new StringToken(`*`), ...this.getDataTypeTokens(value)],
      `?column?`,
    );
  }

  divide(value: DataType | Expression<DataType, IsNotNull, any>) {
    return new Expression(
      [...this.tokens, new StringToken(`/`), ...this.getDataTypeTokens(value)],
      `?column?`,
    );
  }

  modulo(value: DataType | Expression<DataType, IsNotNull, any>) {
    return new Expression(
      [...this.tokens, new StringToken(`%`), ...this.getDataTypeTokens(value)],
      `?column?`,
    );
  }

  concat(value: DataType | Expression<DataType, IsNotNull, any>) {
    return new Expression(
      [...this.tokens, new StringToken(`||`), ...this.getDataTypeTokens(value)],
      `?column?`,
    );
  }

  between(a: DataType, b: DataType) {
    return makeCondition([
      ...this.tokens,
      new StringToken(`BETWEEN`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  betweenSymmetric(a: DataType, b: DataType) {
    return makeCondition([
      ...this.tokens,
      new StringToken(`BETWEEN SYMMETRIC`),
      new ParameterToken(a),
      new StringToken(`AND`),
      new ParameterToken(b),
    ]);
  }

  isDistinctFrom(a: DataType) {
    return makeCondition([
      ...this.tokens,
      new StringToken(`IS DISTINCT FROM`),
      new ParameterToken(a),
    ]);
  }

  isNotDistinctFrom(a: DataType) {
    return makeCondition([
      ...this.tokens,
      new StringToken(`IS NOT DISTINCT FROM`),
      new ParameterToken(a),
    ]);
  }

  like(value: DataType) {
    return makeCondition([...this.tokens, new StringToken(`LIKE`), new ParameterToken(value)]);
  }

  ilike(value: DataType) {
    return makeCondition([...this.tokens, new StringToken(`ILIKE`), new ParameterToken(value)]);
  }

  eq(value: DataType | Expression<DataType, IsNotNull, any> | Query<any>) {
    return makeCondition([...this.tokens, new StringToken(`=`), ...this.getDataTypeTokens(value)]);
  }

  ne(value: DataType | Expression<DataType, IsNotNull, any> | Query<any>) {
    return makeCondition([...this.tokens, new StringToken(`<>`), ...this.getDataTypeTokens(value)]);
  }

  gt(value: DataType | Expression<DataType, IsNotNull, any> | Query<any>): Condition {
    return makeCondition([...this.tokens, new StringToken(`>`), ...this.getDataTypeTokens(value)]);
  }

  gte(value: DataType | Expression<DataType, IsNotNull, any> | Query<any>) {
    return makeCondition([...this.tokens, new StringToken(`>=`), ...this.getDataTypeTokens(value)]);
  }

  lt(value: DataType | Expression<DataType, IsNotNull, any> | Query<any>) {
    return makeCondition([...this.tokens, new StringToken(`<`), ...this.getDataTypeTokens(value)]);
  }

  lte(value: DataType | Expression<DataType, IsNotNull, any> | Query<any>) {
    return makeCondition([...this.tokens, new StringToken(`<=`), ...this.getDataTypeTokens(value)]);
  }

  /** @internal */
  toTokens(includeAlias?: boolean) {
    return this.tokens;
  }
}
