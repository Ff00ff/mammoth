import { Condition, makeCondition } from './condition';
import { GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from './tokens';

import { Query } from './query';

export class Expression<DataType, IsNotNull extends boolean, Name extends string = '?column?'> {
  private _expressionBrand: any;

  constructor(private readonly tokens: Token[]) {}

  private getDataTypeTokens(value: DataType | Expression<DataType, true>) {
    if (
      value &&
      typeof value === `object` &&
      'toTokens' in value &&
      typeof value.toTokens === `function`
    ) {
      return value.toTokens();
    }

    return [new ParameterToken(value)];
  }

  as<AliasName extends string>(name: AliasName) {
    if (this.tokens.length > 2) {
      return new Expression<DataType, IsNotNull, AliasName>([
        new GroupToken(this.tokens),
        new StringToken(`"${name}"`),
      ]);
    }

    return new Expression<DataType, IsNotNull, AliasName>([
      ...this.tokens,
      new StringToken(`"${name}"`),
    ]);
  }

  isNull() {
    return makeCondition([...this.tokens, new StringToken(`IS NULL`)]);
  }

  isNotNull() {
    return makeCondition([...this.tokens, new StringToken(`IS NOT NULL`)]);
  }

  asc() {
    return new Expression([...this.tokens, new StringToken(`ASC`)]);
  }

  desc() {
    return new Expression([...this.tokens, new StringToken(`DESC`)]);
  }

  nullsFirst() {
    return new Expression([...this.tokens, new StringToken(`NULLS FIRST`)]);
  }

  nullsLast() {
    return new Expression([...this.tokens, new StringToken(`NULLS LAST`)]);
  }

  in(array: DataType[] | Expression<DataType, IsNotNull> | Query<any>) {
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

  notIn(array: DataType[] | Expression<DataType, IsNotNull> | Query<any>) {
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

  plus(value: DataType | Expression<DataType, IsNotNull>): Expression<DataType, IsNotNull> {
    return new Expression([...this.tokens, new StringToken(`+`), ...this.getDataTypeTokens(value)]);
  }

  minus(value: DataType | Expression<DataType, IsNotNull>) {
    return new Expression([...this.tokens, new StringToken(`-`), ...this.getDataTypeTokens(value)]);
  }

  multiply(value: DataType | Expression<DataType, IsNotNull>) {
    return new Expression([...this.tokens, new StringToken(`*`), ...this.getDataTypeTokens(value)]);
  }

  divide(value: DataType | Expression<DataType, IsNotNull>) {
    return new Expression([...this.tokens, new StringToken(`/`), ...this.getDataTypeTokens(value)]);
  }

  modulo(value: DataType | Expression<DataType, IsNotNull>) {
    return new Expression([...this.tokens, new StringToken(`%`), ...this.getDataTypeTokens(value)]);
  }

  concat(value: DataType | Expression<DataType, IsNotNull>) {
    return new Expression([
      ...this.tokens,
      new StringToken(`||`),
      ...this.getDataTypeTokens(value),
    ]);
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

  eq(value: DataType | Expression<DataType, IsNotNull>) {
    return makeCondition([...this.tokens, new StringToken(`=`), ...this.getDataTypeTokens(value)]);
  }

  ne(value: DataType | Expression<DataType, IsNotNull>) {
    return makeCondition([...this.tokens, new StringToken(`<>`), ...this.getDataTypeTokens(value)]);
  }

  gt(value: DataType | Expression<DataType, IsNotNull>) {
    return makeCondition([...this.tokens, new StringToken(`>`), ...this.getDataTypeTokens(value)]);
  }

  gte(value: DataType | Expression<DataType, IsNotNull>) {
    return makeCondition([...this.tokens, new StringToken(`>=`), ...this.getDataTypeTokens(value)]);
  }

  lt(value: DataType | Expression<DataType, IsNotNull>) {
    return makeCondition([...this.tokens, new StringToken(`<`), ...this.getDataTypeTokens(value)]);
  }

  lte(value: DataType | Expression<DataType, IsNotNull>) {
    return makeCondition([...this.tokens, new StringToken(`<=`), ...this.getDataTypeTokens(value)]);
  }

  /** @internal */
  toTokens(includeAlias?: boolean) {
    return this.tokens;
  }
}
