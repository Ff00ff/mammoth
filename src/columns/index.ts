import { Default, Keyword } from '../keywords';
import { PartialQuery } from '../query';
import { TableWrapper } from '../table';
import { CollectionToken, GroupToken, ParameterToken, StringToken, Token } from '../tokens';
import { Unsafe } from '../unsafe';

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
	columnFunction?: ColumnFunction<T, any>;
}
export type ColumnFunction<T, Db> = (db: Db) => ColumnWrapper<any, T, any, any, any>;

export type AggregateType = 'COUNT' | 'MIN' | 'MAX' | 'AVG' | 'SUM';

export class ColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> {
	table: TableWrapper<any>;
	column: Column<any>;

	name: Name;
	baseType: BaseType;
	selectType: SelectType;
	insertType: InsertType;
	updateType: UpdateType;

	snakeCaseName: string;
	camelCaseName: string;

	constructor(table: TableWrapper<any>, column: Column<any>, camelCaseName: string, snakeCaseName: string) {
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

	getSnakeCaseName() {
		return this.snakeCaseName;
	}

	getCamelCaseName() {
		return this.camelCaseName;
	}

	getConfig() {
		return this.column.config;
	}

	as<A extends string>(aliasName: A): ColumnWrapper<A, BaseType, SelectType, InsertType, UpdateType> {
		return new AliasedColumnWrapper(aliasName, this.toTokens(), this.table, this.column, this.camelCaseName, this.snakeCaseName);
	}

	isNull() {
		const query = new PartialQuery();
		query.tokens.push(
			new StringToken(this.toSql()),
			new StringToken(`IS NULL`),
		);
		return query;
	}

	isNotNull() {
		const query = new PartialQuery();
		query.tokens.push(
			new StringToken(this.toSql()),
			new StringToken(`IS NOT NULL`),
		);
		return query;
	}

	asc() {
		return new PartialQuery(new StringToken(this.toSql()), new StringToken(`ASC`));
	}

	desc() {
		return new PartialQuery(new StringToken(this.toSql()), new StringToken(`DESC`));
	}

	in(array: BaseType[]) {
		return new PartialQuery(
			// TODO: should we change this to a toTokens() call instead?
			new StringToken(`${this.table.getName()}.${this.name}`),
			new StringToken(`IN`),
			new GroupToken([new ParameterToken(array)]),
		)
	}

	private aggregate<Type = BaseType>(aggregateType: AggregateType) {
		// TODO: the type probably needs to change in case of count?
		const defaultName = aggregateType.toLowerCase();

		return new AggregateColumnWrapper<typeof defaultName, Type, Type, Type, Type>(aggregateType, this.table, this.column, this.camelCaseName, this.snakeCaseName);
	}

	toSql() {
		return `${this.table!.getName()}.${this.snakeCaseName}`;
	}

	toTokens(): Token[] {
		return [
			new StringToken(this.toSql()),
		];
	}

	toReferenceExpressionTokens(): Token[] {
		return this.toTokens();
	}

	count() { return this.aggregate<string>(`COUNT`); }
	sum() { return this.aggregate(`SUM`); }
	min() { return this.aggregate(`MIN`); }
	max() { return this.aggregate(`MAX`); }
	avg() { return this.aggregate(`AVG`); }

	private operate(operator: '+' | '-' | '*' | '/' | '%', value: BaseType) {
		return new PartialQuery(
			new StringToken(this.toSql()),
			new StringToken(operator),
			new ParameterToken(value),
		);
	}

	// TODO: should we add these on specific column types only? E.g. NumberColumn.
	plus(value: BaseType) { return this.operate(`+`, value); }
	minus(value: BaseType) { return this.operate(`+`, value); }
	multiply(value: BaseType) { return this.operate(`+`, value); }
	divide(value: BaseType) { return this.operate(`/`, value); }
	modulo(value: BaseType) { return this.operate(`%`, value); }

	// TODO: should this only be on TextColumn exclusively?
	concat(value: BaseType | ColumnWrapper<any, any, any, any, any>) {
		return new PartialQuery(
			new StringToken(this.toSql()),
			new StringToken(`||`),
			value instanceof ColumnWrapper
				? new CollectionToken(value.toTokens())
				: new ParameterToken(value),
		);
	}

	between(a: BaseType, b: BaseType) {
		return new PartialQuery(
			new StringToken(this.toSql()),
			new StringToken(`BETWEEN`),
			new ParameterToken(a),
			new StringToken(`AND`),
			new ParameterToken(b),
		);
	}

	private compare<C extends BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery>(value: C, comparator: string) {
		const query = new PartialQuery();
		query.tokens.push(
			new StringToken(this.toSql()),
			new StringToken(comparator),
		);

		if (value instanceof ColumnWrapper) {
			query.tokens.push(...value.toReferenceExpressionTokens());
		}
		else if (value instanceof PartialQuery) {
			query.tokens.push(...value.tokens);
		}
		else {
			query.tokens.push(new ParameterToken(value));
		}
		return query;
	}

	eq(value: BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) { return this.compare(value, `=`); }
	ne(value: BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) { return this.compare(value, `!=`); }
	gt(value: BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) { return this.compare(value, `>`); }
	gte(value: BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) { return this.compare(value, `>=`); }
	lt(value: BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) { return this.compare(value, `>=`); }
	lte(value: BaseType | ColumnWrapper<any, BaseType, any, any, any> | PartialQuery) { return this.compare(value, `<=`); }
}

export class AliasedColumnWrapper<Name extends string, BaseType, SelectType, InsertType, UpdateType> extends ColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> {
	private tokens: Token[];

	constructor(name: Name, tokens: Token[], table: TableWrapper<any>, column: Column<any>, camelCaseName: string, snakeCaseName: string) {
		super(table, column, camelCaseName, snakeCaseName);

		this.tokens = tokens;
		this.name = name;
	}

	getSnakeCaseName() {
		return this.name;
	}

	getCamelCaseName() {
		return this.name;
	}

	toTokens() {
		return [
			...this.tokens,
			new StringToken(`AS "${this.name}"`),
		];
	}

	toReferenceExpressionTokens() {
		return this.tokens;
	}
}

export class AggregateColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> extends ColumnWrapper<Name, BaseType, SelectType, InsertType, UpdateType> {
	aggregateType: AggregateType;

	constructor(aggregateType: AggregateType, table: TableWrapper<any>, column: Column<any>, camelCaseName: string, snakeCaseName: string) {
		super(table, column, camelCaseName, snakeCaseName);

		this.aggregateType = aggregateType;
	}

	toSql() {
		return `${this.aggregateType}(${super.toSql()})`;
	}
}

export const toSnakeCase = (string: string) => string.replace(/([^A-Z]|[A-Z]{1,})([A-Z])/g, '$1_$2').toLowerCase();

export class Column<T, IT = T | null, ST = T | null, UT = T> {
	dataType: string;

	// These types are required
	type: T;
	insertType: IT;
	selectType: ST;
	updateType: UT;

	/** @internal */
	name?: string;
	/** @internal */
	key?: string;
	/** @internal */
	table?: TableWrapper<any>;

	config: ColumnConfig<T>;

  constructor(name?: string, config = {}) {
		this.name = name;

		this.dataType = undefined as any;
		this.type = undefined as any;
		this.insertType = undefined as any;
		this.selectType = undefined as any;
		this.updateType = undefined as any;

		this.config = config;
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
  setTable<TW extends TableWrapper<any>>(table: TW) {
		// TODO: why do we need the complete table here? If it's just for the table's name, can we just set the name instead?
    this.table = table;
	}

	primary(): Column<T, T | null, T> {
		this.config.primary = true;

		return this as any as Column<T, T | null, T>;
	}

	primaryKey() {
		return this.primary();
	}

	unique() {
		this.config.unique = true;
		return this;
	}

	notNull(): Column<T, T, T> {
		this.config.notNull = true;

		return this as any as Column<T, T, T>;
	}

	check(sql: string) {
		this.config.check = sql;
		return this;
	}

	default(sql: T | Unsafe | Keyword): Column<T, T | null, ST, UT | Default> {
		this.config.default = (sql && (sql instanceof Unsafe || sql instanceof Keyword))
			? sql.toSql()
			: sql;
		return this as any as Column<T, T | null, ST, UT | Default>;
	}

	/** @internal */
	createReference<Db>(db: Db) {
		if (this.config.columnFunction) {
			const column = this.config.columnFunction(db);

			this.config.references = {
				tableName: column.table!.getName(),
				columnName: column.name!,
			};
			this.config.columnFunction = undefined;
		}
	}

	references<Db>(columnFunction: ColumnFunction<T, Db>) {
		this.config.columnFunction = columnFunction;
		return this;
	}
}

export class TextColumn extends Column<string> {
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
export class SerialColumn extends Column<number, number | null> {
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
	dataType = 'INTERVAL'
}
export class MoneyColumn extends Column<number> {
	dataType = 'MONEY';
}

export class Uuid extends String {
	constructor(string: string) {
		super(string);
	}

	// FIXME: we want this type to be treated different than string for extra safety.
	_unused() {} // tslint:disable-line
}

export class UuidColumn extends Column<Uuid> {
	dataType = 'UUID';
}

export class StringColumn extends TextColumn {}
export class NumberColumn extends IntegerColumn {}

export class ByteaColumn extends Column<Buffer> {
	dataType = 'BYTEA';
}
export class BlobColumn extends ByteaColumn {}
export class BinaryColumn extends ByteaColumn {}