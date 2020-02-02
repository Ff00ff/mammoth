import { Default, Keyword } from '../keywords';
import { PartialQuery, SelectQuery, Query } from '../query';
import { Table } from '../table';
import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  StringToken,
  Token,
  SeparatorToken,
} from '../tokens';
import { Unsafe } from '../unsafe';
import { Null, toNotNull, toNull, toType } from '../types';

export type RowActionType = 'restrict' | 'cascade' | 'no action';

export interface ColumnConfig<T> {
  primary?: boolean;
  default?: T | string; // TODO: Instead of string this should be new Raw() or something.
  check?: string;
  notNull?: boolean;
  unique?: boolean;
  references?: {
    tableName: string;
    columnName: string;
  };
  columnFunction?: ColumnFunction<T>;
  onDelete?: RowActionType;
  onUpdate?: RowActionType;
}
export type ColumnFunction<T> = () => ColumnWrapper<any, T, any, any, any>;

export type AggregateType = 'COUNT' | 'MIN' | 'MAX' | 'AVG' | 'SUM';

// export interface Column {
//   //
// }

export class ColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> {
  table: Table<any>;
  column: Column<any>;

  name: Name;
  baseType: BaseType;
  selectType: SelectType;
  insertType: InsertType;
  updateType: UpdateType;

  snakeCaseName: string;
  camelCaseName: string;

  constructor(
    table: Table<any>,
    column: Column<any>,
    camelCaseName: string,
    snakeCaseName: string,
  ) {
    this.table = table;
    this.column = column;
    this.camelCaseName = camelCaseName;
    this.snakeCaseName = snakeCaseName;

    this.name = undefined as any;
    this.baseType = undefined as any;
    this.selectType = undefined as any;
    this.insertType = undefined as any;
    this.updateType = undefined as any;
  }

  getNameInResultSet() {
    return this.snakeCaseName;
  }

  getSnakeCaseName() {
    return this.snakeCaseName;
  }

  getCamelCaseName() {
    return this.camelCaseName;
  }

  getConfig() {
    return this.column.config;
  }

  as<A extends string>(
    aliasName: A,
  ): ColumnWrapper<A, BaseType, SelectType, InsertType, UpdateType> {
    return new AliasedColumnWrapper(
      aliasName,
      this.toTokens(),
      this.table,
      this.column,
      this.camelCaseName,
      this.snakeCaseName,
    );
  }

  // TODO: perhaps depending on NotNull<T> or Null<T> we could decide to expose these or not.
  isNull() {
    const query = new PartialQuery();
    query.tokens.push(new StringToken(this.toSql()), new StringToken(`IS NULL`));
    return query;
  }

  isNotNull() {
    const query = new PartialQuery();
    query.tokens.push(new StringToken(this.toSql()), new StringToken(`IS NOT NULL`));
    return query;
  }

  asc() {
    return new PartialQuery(new StringToken(this.toSql()), new StringToken(`ASC`));
  }

  desc() {
    return new PartialQuery(new StringToken(this.toSql()), new StringToken(`DESC`));
  }

  // TODO: we should make the return value of the SelectQuery type safe here.
  in(array: toType<BaseType>[] | SelectQuery<any, any, any, any, any, any>) {
    if (array instanceof SelectQuery) {
      return new PartialQuery(
        ...this.toTokens(),
        new StringToken(`IN`),
        new GroupToken(array.toTokens()),
      );
    }

    return new PartialQuery(
      ...this.toTokens(),
      new StringToken(`IN`),
      // FIXME: it should be possible to just pass a single parameter token into the group with an
      // array as parameter. Unfortunately this fails in practice.
      new GroupToken([
        new SeparatorToken(
          ',',
          array.map(param => new ParameterToken(param)),
        ),
      ]),
    );
  }

  private aggregate<Type = BaseType>(aggregateType: AggregateType) {
    return new AggregateColumnWrapper<Name, Type, Type, Type, Type>(
      aggregateType,
      this.table,
      this.column,
      this.camelCaseName,
      this.snakeCaseName,
    );
  }

  toSql() {
    return `${this.table!.getName()}.${this.snakeCaseName}`;
  }

  toTokens(): Token[] {
    return [new StringToken(this.toSql())];
  }

  toReferenceExpressionTokens(): Token[] {
    return this.toTokens();
  }

  count() {
    // Result of COUNT() in postgres is a string
    return this.aggregate<string>(`COUNT`);
  }
  sum() {
    return this.aggregate(`SUM`);
  }
  min(): AggregateColumnWrapper<'min', BaseType, BaseType, BaseType, BaseType> {
    return this.aggregate(`MIN`) as any;
  }
  max() {
    return this.aggregate(`MAX`);
  }
  avg() {
    return this.aggregate(`AVG`);
  }

  private operate(operator: '+' | '-' | '*' | '/' | '%', value: toType<BaseType>) {
    return new PartialQuery(
      new StringToken(this.toSql()),
      new StringToken(operator),
      new ParameterToken(value),
    );
  }

  // TODO: should we add these on specific column types only? E.g. NumberColumn.
  plus(value: toType<BaseType>) {
    return this.operate(`+`, value);
  }
  minus(value: toType<BaseType>) {
    return this.operate(`-`, value);
  }
  multiply(value: toType<BaseType>) {
    return this.operate(`+`, value);
  }
  divide(value: toType<BaseType>) {
    return this.operate(`/`, value);
  }
  modulo(value: toType<BaseType>) {
    return this.operate(`%`, value);
  }

  // TODO: should this only be on TextColumn exclusively?
  concat(value: toType<BaseType> | ColumnWrapper<any, any, any, any, any>) {
    return new PartialQuery(
      new StringToken(this.toSql()),
      new StringToken(`||`),
      value instanceof ColumnWrapper
        ? new CollectionToken(value.toTokens())
        : new ParameterToken(value),
    );
  }

  between(a: toType<BaseType>) {
    return {
      and: (b: toType<BaseType>) =>
        new PartialQuery(
          new StringToken(this.toSql()),
          new StringToken(`BETWEEN`),
          new ParameterToken(a),
          new StringToken(`AND`),
          new ParameterToken(b),
        ),
    };
  }

  betweenSymmetric(a: toType<BaseType>) {
    return {
      and: (b: toType<BaseType>) =>
        new PartialQuery(
          new StringToken(this.toSql()),
          new StringToken(`BETWEEN SYMMETRIC`),
          new ParameterToken(a),
          new StringToken(`AND`),
          new ParameterToken(b),
        ),
    };
  }

  isDistinctFrom(a: toType<BaseType>) {
    return new PartialQuery(
      new StringToken(this.toSql()),
      new StringToken(`IS DISTINCT FROM`),
      new ParameterToken(a),
    );
  }

  isNotDistinctFrom(a: toType<BaseType>) {
    return new PartialQuery(
      new StringToken(this.toSql()),
      new StringToken(`IS NOT DISTINCT FROM`),
      new ParameterToken(a),
    );
  }

  notIn(value: toType<BaseType>[]) {
    return new PartialQuery(
      new StringToken(this.toSql()),
      new StringToken(`NOT IN`),
      new GroupToken([
        new SeparatorToken(
          ',',
          value.map(val => new ParameterToken(val)),
        ),
      ]),
    );
  }

  private compare<
    C extends
      | toType<BaseType>
      | ColumnWrapper<any, BaseType, any, any, any>
      | PartialQuery
      | Query<any, any, { [id: string]: toType<BaseType> }>
  >(value: C, comparator: string) {
    const query = new PartialQuery();
    query.tokens.push(new StringToken(this.toSql()), new StringToken(comparator));

    if (value instanceof ColumnWrapper) {
      query.tokens.push(...value.toReferenceExpressionTokens());
    } else if (value instanceof PartialQuery) {
      query.tokens.push(...value.tokens);
    } else if (value instanceof Query) {
      query.tokens.push(...value.toTokens());
    } else {
      query.tokens.push(new ParameterToken(value));
    }
    return query;
  }

  like(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `LIKE`);
  }

  ilike(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `ILIKE`);
  }

  eq(
    value:
      | toType<BaseType>
      | ColumnWrapper<any, BaseType, any, any, any>
      | PartialQuery
      | Query<any, any, { [id: string]: toType<BaseType> }>,
  ) {
    return this.compare(value, `=`);
  }
  ne(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `!=`);
  }
  gt(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `>`);
  }
  gte(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `>=`);
  }

  lt(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `<`);
  }
  lte(value: toType<BaseType> | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) {
    return this.compare(value, `<=`);
  }
}

export class AliasedColumnWrapper<
  Name extends string,
  BaseType,
  SelectType,
  InsertType,
  UpdateType
> extends ColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> {
  private tokens: Token[];

  constructor(
    name: Name,
    tokens: Token[],
    table: Table<any>,
    column: Column<any>,
    camelCaseName: string,
    snakeCaseName: string,
  ) {
    super(table, column, camelCaseName, snakeCaseName);

    this.tokens = tokens;
    this.name = name;
  }

  getNameInResultSet() {
    return this.name;
  }

  getSnakeCaseName() {
    return this.name;
  }

  getCamelCaseName() {
    return this.name;
  }

  toTokens() {
    return [...this.tokens, new StringToken(`AS "${this.name}"`)];
  }

  toReferenceExpressionTokens() {
    return this.tokens;
  }
}

export class AggregateColumnWrapper<
  Name,
  BaseType,
  SelectType,
  InsertType,
  UpdateType
> extends ColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> {
  aggregateType: AggregateType;

  constructor(
    aggregateType: AggregateType,
    table: Table<any>,
    column: Column<any>,
    camelCaseName: string,
    snakeCaseName: string,
  ) {
    super(table, column, camelCaseName, snakeCaseName);

    this.aggregateType = aggregateType;
  }

  toSql() {
    return `${this.aggregateType}(${super.toSql()})`;
  }

  getNameInResultSet() {
    return this.aggregateType.toLowerCase();
  }
}

export const toSnakeCase = (string: string) =>
  string.replace(/([^A-Z]|[A-Z]{1,})([A-Z])/g, '$1_$2').toLowerCase();

export class Column<T, IT = Null<T>, ST = Null<T>, UT = T> {
  dataType?: string;

  // These types are required
  type!: T;
  insertType!: IT;
  selectType!: ST;
  updateType!: UT;

  /** @internal */
  name?: string;
  /** @internal */
  key?: string;
  /** @internal */
  table?: Table<any>;

  config: ColumnConfig<T> = {};

  constructor(dataType?: string) {
    if (dataType) {
      this.dataType = dataType;
    }
  }

  /** @internal */
  getSnakeCaseName(camelCaseName: string) {
    // TODO: this should be a string, not string | undefined.
    return this.name || toSnakeCase(camelCaseName);
  }

  /** @internal */
  setSnakeCaseName(name: string) {
    // TODO: is this even used?
    this.name = name;
  }

  /** @internal */
  setKey(key: string) {
    // TODO: should this be camelCaseName instead?
    this.key = key;
  }

  /** @internal */
  setTable<TW extends Table<any>>(table: TW) {
    // TODO: why do we need the complete table here? If it's just for the table's name, can we just set the name instead?
    this.table = table;
  }

  primary(): Column<T, T, T> {
    this.config.primary = true;

    return this as any;
  }

  primaryKey() {
    return this.primary();
  }

  unique() {
    this.config.unique = true;
    return this;
  }

  notNull(): Column<toNotNull<T>, toNotNull<T>, toNotNull<T>> {
    this.config.notNull = true;

    return this as any;
  }

  check(sql: string) {
    this.config.check = sql;
    return this;
  }

  default(sql: T | Unsafe | Keyword): Column<T, toNull<T | Default>, ST, toNull<UT | Default>> {
    const escape = (val: T) => {
      if (typeof val === 'number' || typeof val === 'boolean') {
        return val;
      }

      // FIXME: this escaping is too simple.
      return `'${val}'`;
    };

    this.config.default =
      sql && (sql instanceof Unsafe || sql instanceof Keyword) ? sql.toSql() : escape(sql);
    return this as any;
  }

  /** @internal */
  createReference() {
    if (this.config.columnFunction) {
      const column = this.config.columnFunction();

      this.config.references = {
        tableName: column.table!.getName(),
        columnName: column.snakeCaseName,
      };
      this.config.columnFunction = undefined;
    }
  }

  references(columnFunction: ColumnFunction<T>) {
    this.config.columnFunction = columnFunction;
    return this;
  }

  onDelete() {
    return {
      cascade: (): Column<T, IT, ST, UT> => {
        this.config.onDelete = 'cascade';
        return this;
      },

      restrict: (): Column<T, IT, ST, UT> => {
        this.config.onDelete = 'restrict';
        return this;
      },

      noAction: (): Column<T, IT, ST, UT> => {
        this.config.onDelete = 'no action';
        return this;
      },
    };
  }

  onUpdate() {
    // TODO: add SET NULL, SET DEFAULT as well.

    return {
      cascade: (): Column<T, IT, ST, UT> => {
        this.config.onUpdate = 'cascade';
        return this;
      },

      restrict: (): Column<T, IT, ST, UT> => {
        this.config.onUpdate = 'restrict';
        return this;
      },

      noAction: (): Column<T, IT, ST, UT> => {
        this.config.onUpdate = 'no action';
        return this;
      },
    };
  }
}

export class TextColumn<T = string> extends Column<T> {
  dataType = 'TEXT';
}
export class CitextColumn extends Column<string> {
  dataType = 'CITEXT';
}
export class CaseInsensitiveTextColumn extends CitextColumn {}
export class IntegerColumn extends Column<number> {
  dataType = 'INTEGER';
}
export class DecimalColumn extends Column<number> {
  dataType = 'DECIMAL';
}
export class SerialColumn extends Column<number, number | null, number, number | Default> {
  dataType = 'SERIAL';
}
export class JSONColumn<T> extends Column<T> {
  dataType = 'JSON';
}
export class JSONBColumn<T> extends Column<T> {
  dataType = 'JSONB';
}
export class TimestampWithTimeZoneColumn extends Column<Date> {
  dataType = 'TIMESTAMP WITH TIME ZONE';
}
export class TimestampWithoutTimeZoneColumn extends Column<Date> {
  dataType = 'TIMESTAMP WITHOUT TIME ZONE';
}
export class TimestampColumn extends Column<Date> {
  dataType = 'TIMESTAMP';
}
export class DateColumn extends Column<Date> {
  dataType = 'DATE';
}
export class TimeColumn extends Column<Date> {
  dataType = 'TIME';
}
export class TimeWithoutTimeZoneColumn extends Column<Date> {
  dataType = 'TIME WITHOUT TIME ZONE';
}
export class TimeWithTimeZoneColumn extends Column<Date> {
  dataType = 'TIME WITH TIME ZONE';
}
export class IntervalColumn extends Column<number> {
  dataType = 'INTERVAL';
}
export class MoneyColumn extends Column<number> {
  dataType = 'MONEY';
}
export class BooleanColumn extends Column<boolean> {
  dataType = 'BOOLEAN';
}

export class UuidColumn extends Column<string> {
  dataType = 'UUID';
}

export class StringColumn extends TextColumn {}
export class NumberColumn extends IntegerColumn {}

export class ByteaColumn extends Column<Buffer> {
  dataType = 'BYTEA';
}
export class BlobColumn extends ByteaColumn {}
export class BinaryColumn extends ByteaColumn {}

export class EnumColumn<A extends string> extends Column<A> {
  values: string[];

  constructor(values: A[], name?: string) {
    super();

    this.dataType = name;
    this.values = values as any;
  }
}
